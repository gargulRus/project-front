function getPlayers(pageNumber = null, pageSize = null) {

    let getUri;
    let row = "";
    let pagesCount;
    let pagesRow = "";

    /*
        Если pageSize - значит это первичная загрузка страницы. В селекторе отображения будет 3
        Значит тут тоже хардкодим 3, иначе - pageSize
     */
    if (pageSize == null) {
        pagesCount = Math.ceil(playersCount/3);
    } else {
        pagesCount = Math.ceil(playersCount/pageSize);
    }

    /*
        Если pageNumber - значит это первичная загрузка страницы.
        Формируем URI-запрос по умолчанию. Иначе передаем дополнительные параметры через GET
     */
    if (pageNumber == null) {
        if (pageSize == null) {
            getUri = "/rest/players";
            pageSize = 3;
        } else {
            getUri = "/rest/players?pageSize=" + pageSize;
        }
    } else {
        /*
            Это нужно в момент, когда удаляется старный персонаж,
            а пагинация уменьшится на 1.
            Значит нужно и здесь уменьшить pageNumber. Т.к. в функцию передастся неактуальное значение
         */
        if (pagesCount == pageNumber) {--pageNumber;}
        getUri = "/rest/players?pageNumber=" + pageNumber + "&pageSize=" + pageSize;
    }

    //Отправляем запрос
    $.get(getUri, function(data){
        for (let i = 0; i < data.length; i++) {

            let id = data[i].id;
            let name = data[i].name;
            let title = data[i].title;
            let race = data[i].race;
            let profession = data[i].profession;
            let birthday = data[i].birthday;
            let banned = data[i].banned;
            let level = data[i].level;

            row += "<tr id='characteRow'>" +
                "<td id='charId'>" + id + "</td>" +
                "<td id='charName'>" + name + "</td>" +
                "<td id='charTitle'>" + title + "</td>" +
                "<td id='charRace'>" + race + "</td>" +
                "<td id='charProf'>" + profession + "</td>" +
                "<td id='charLevel'>" + level + "</td>" +
                "<td id='charBirth'>" + new Date(birthday).toLocaleDateString() + "</td>" +
                "<td id='charBanned'>" + banned + "</td>" +
                "<td id='btnEdit'><a href='#' class='btnEdit' data-ident='" +  id + "' ><i class='bi bi-pencil-fill btn-custom-color-size'></i></a></td>" +
                "<td id='btnDel'><a href='#' class='btnDel' data-ident='" +  id + "' ><i class='bi bi-trash-fill btn-custom-color-size'></i></a></td>" +
                "</tr>";
            $("#account-table tbody").html(row);

        }
        //Вешаем обработчики нажатия на кнопки Редактирования и Удаления
        editClick();
        deleteClick();

    });
    //Формируем кол-во страниц
    if (pagesCount > 0) {
        pagesRow += "";
        for (let i = 0; i < pagesCount; i++) {
            //Что бы начинались не с 0
            let page = i + 1;
            //Следим - какая сейчас страница нажата
            if (pageNumber == null && i == 0) {
                pagesRow +=
                    "<a href='#' class='pageLoad page-link active' data-pageNumber='" + i + "' data-pageSize='" + pageSize+"'>" + page + "</a>";
            } else if (pageNumber == i ) {
                pagesRow +=
                    "<a href='#' class='pageLoad page-link active' data-pageNumber='" + i + "' data-pageSize='" + pageSize+"'>" + page + "</a>";
            } else {
                pagesRow +=
                    "<a href='#' class='pageLoad page-link' data-pageNumber='" + i + "' data-pageSize='" + pageSize+"'>" + page + "</a>";
            }

        }

        $("#pagination p").html(pagesRow);
    }
    //Вешаем обработчик пагинации
    paginationClick();

}

//Функция обработчика пагинации. Тут все понятно.
function paginationClick() {

    $("#pagination p a").unbind("click");
    $("#pagination p a").bind("click", function () {

        let pageNumber = $(this).attr("data-pageNumber");
        let pageSize = $(this).attr("data-pageSize");

        $("#pageNumberHidden").val(pageNumber);
        $("#pageSizeHidden").val(pageSize);

        getPlayers(pageNumber, pageSize);
    });
}

//Функция сохранения Нового Персонажа.
function saveNewChar() {

    $("#saveNewChar").unbind("click");
    $("#saveNewChar").bind("click", function () {

        //Чистим label для ошибок
        clearAlerstForm();

        let newCharName = $("#newCharName").val();
        let newCharTitle = $("#newCharTitle").val();
        let newCharRaceSelect = $("#newCharRaceSelect").val();
        let newCharProfessionSelect = $("#newCharProfessionSelect").val();
        let newCharLevel = Number.parseInt($("#newCharLevel").val());
        let newCharBirthday = $("#newCharBirthday").val();
        let dateToCheck = new Date(newCharBirthday);
        let newCharBanned = $("#newCharBanned").val();

        //Валидируем данные с формы
        if (!validateForm(newCharName, newCharTitle, newCharLevel, dateToCheck)) {
            return false;
        }

        //Приводим дату к Long
        let dateToMilisec = Date.parse(newCharBirthday);

        //Формируем Json
        let jsonToServer = {
            name:newCharName,
            title:newCharTitle,
            race:newCharRaceSelect,
            profession: newCharProfessionSelect,
            birthday: dateToMilisec,
            level: newCharLevel,
            banned:newCharBanned
        };

        //Получаем текущий текущую страницу и размер отображения
        let pageNumber = $("#pageNumberHidden").val();
        let pageSize = $("#pageSizeHidden").val();

        //Отправляем AJAX запрос. (Синхронный на всякий случай)
        $.ajax({
            type: "POST",
            url: "/rest/players",
            cache: false,
            async: false,
            data: JSON.stringify(jsonToServer),
            contentType:"application/json; charset=utf-8",
            dataType: "json",
            success: function () {
                //Если успешно - чистим форму, обновляем playersCount
                clearForm();
                getPlayersCount();
                let pagesCount = Math.ceil(playersCount/pageSize);
                //Следим, что бы при создании ново персонажа и увеличения пагинации на 1 - отобразилась актуальная страница
                if ((pagesCount - pageNumber) == 2) {
                    ++pageNumber;
                } else if ((pagesCount - pageNumber) > 2) {
                    pageNumber = pagesCount - 1;
                }
                //Обновляем таблицу
                getPlayers(pageNumber, pageSize);
            }
        });
    });
}

//Функция удаления старого персонажа. Тоже ничего нового.
function deleteClick() {

    $("#btnDel a").unbind("click");
    $("#btnDel a").bind("click", function () {

        let idToDel = $(this).attr("data-ident");
        let pageNumber = $("#pageNumberHidden").val();
        let pageSize = $("#pageSizeHidden").val();
        let getUri = "/rest/players/" + idToDel;

        $.ajax({
            type: "DELETE",
            url: getUri,
            cache: false,
            async: false,
            success: function () {
                getPlayersCount();
                getPlayers(pageNumber, pageSize);
            }
        });
    });
}

//Функция редактирования старого персонажа.
function editClick() {

    $("#characteRow > #btnEdit a").unbind("click");
    $("#characteRow > #btnEdit a").bind("click", function () {
        /*
            При клике на кнопку - надо получить данные со всей строчки таблицы.
            Шагаем вверх по иерархии тэгов.
            Получаем список всех children и с ними работаем.
         */
        let row = $(this).closest("tr");
        let charId = row.children("td").eq(0);
        let charName = row.children("td").eq(1);
        let charTitle = row.children("td").eq(2);
        let charRace = row.children("td").eq(3);
        let charProf = row.children("td").eq(4);
        let charBanned = row.children("td").eq(7);
        let btnEdit = row.children("td").eq(8);
        let btnDel = row.children("td").eq(9);

        //Генерируем выпадающие списки.
        let selectRace = genereateSelectRace();
        let selectProfession = genereateSelectProfession();
        let selectBanned = genereateSelectBanned();

        //Получаем актуальные данные с каждой ячейки.
        let charIdData = charId.html();
        let charNameData = charName.html();
        let charTitleData = charTitle.html();
        let charRaceData = charRace.html();
        let charProfData = charProf.html();
        let charBannedData = charBanned.html();

        //Меняем содержимое необходимых ячеек.
        charName.html("<input type='text' id='charName' size='5' name='charName' value='"+ charNameData +"'>");
        charTitle.html("<input type='text' id='charTitle' name='charTitle' value='"+ charTitleData +"'>");
        charRace.html(selectRace);
        charRace.find("#raceSelect").val(charRaceData);
        charProf.html(selectProfession);
        charProf.find("#professionSelect").val(charProfData);
        charBanned.html(selectBanned);
        charBanned.find("#bannedSelect").val(charBannedData);

        //Меняем кнопку Редактирования на Сохранить. Убираем кнопку Удалить.
        btnEdit.html("<a href='#' class='btnSave' id='btnSave' ><i class='bi bi-save-fill btn-custom-color-size'></i></a>");
        let btnSave = btnEdit.find("#btnSave");
        btnDel.html(" ");

        //Тут же обработчик кнопки Сохранить.
        $(btnSave).unbind("click");
        $(btnSave).bind("click", function () {

            //Чистим label для ошибок
            clearAlertsEdit();

            //Валидируем поля с данными
            if(!validateEdit(charName.find("#charName").val(), charTitle.find("#charTitle").val())){
                return false;
            }

            //Далее по аналогии с созданием нового персонажа.
            let pageNumber = $("#pageNumberHidden").val();
            let pageSize = $("#pageSizeHidden").val();

            let jsonToServer = {
                id:charIdData,
                name:charName.find("#charName").val(),
                title:charTitle.find("#charTitle").val(),
                race:charRace.find("#raceSelect").val(),
                profession: charProf.find("#professionSelect").val(),
                banned:charBanned.find("#bannedSelect").val()
            };

            let getUri = "/rest/players/" + charIdData;

            $.ajax({
                type: "POST",
                url: getUri,
                cache: false,
                async: false,
                data: JSON.stringify(jsonToServer),
                contentType:"application/json; charset=utf-8",
                dataType: "json",
                success: function () {
                    clearAlertsEdit();
                    getPlayersCount();
                    getPlayers(pageNumber, pageSize);
                }
            });
        });

    });
}
//Функция инициализации и обновления playersCount.
function getPlayersCount() {
    $.ajax({
        type: "GET",
        url: "/rest/players/count",
        cache: false,
        async: false,
        success: function (data) {
            playersCount = data;
        }
    });
}
//Функция генерации списка Race.
function genereateSelectRace() {

    let select;

    select = "" +
        "<select id='raceSelect'>" +
        "<option value='HUMAN'>HUMAN</option>" +
        "<option value='DWARF'>DWARF</option>" +
        "<option value='ELF'>ELF</option>" +
        "<option value='GIANT'>GIANT</option>" +
        "<option value='ORC'>ORC</option>" +
        "<option value='TROLL'>TROLL</option>" +
        "<option value='HOBBIT'>HOBBIT</option>" +
        "</select>";

    return select;
}
//Функция генерации списка Professions.
function genereateSelectProfession() {

    let select;

    select = "" +
        "<select id='professionSelect'>" +
        "<option value='WARRIOR'>WARRIOR</option>" +
        "<option value='ROGUE'>ROGUE</option>" +
        "<option value='SORCERER'>SORCERER</option>" +
        "<option value='CLERIC'>CLERIC</option>" +
        "<option value='PALADIN'>PALADIN</option>" +
        "<option value='NAZGUL'>NAZGUL</option>" +
        "<option value='WARLOCK'>WARLOCK</option>" +
        "<option value='DRUID'>DRUID</option>" +
        "</select>";

    return select;
}
//Функция генерации списка Banned.
function genereateSelectBanned() {

    let select;

    select = "" +
        "<select id='bannedSelect'>" +
        "<option value='false'>false</option>" +
        "<option value='true'>true</option>" +
        "</select>";

    return select;
}
//Функция валидации полей редактирования персонажа.
function validateEdit(charName=null, charTitle=null, ) {

    let validate = true;

    if (charName.length < 1 || charName.length > 12) {
        $("#editAlertName").html("<span class='alert-danger'>Name is Wrong!</span>");
        validate = false;
    }

    if (charTitle.length < 1 || charTitle.length > 30) {
        $("#editAlertTitle").html("<span class='alert-danger'>Title is Wrong!</span>");
        validate = false;
    }

    return validate;
}
//Функция валидации полей создания нового персонажа.
function validateForm(newCharName = null, newCharTitle = null, newCharLevel = null, dateToCheck = null,) {

    let validate = true;

    if (newCharName.length < 1 || newCharName.length > 12) {
        $("#newCharNameAlert").html("<span class='alert-danger'>ALERT - Name is Wrong!</span>");
        validate = false;
    }

    if (newCharTitle.length < 1 || newCharTitle.length > 30) {
        $("#newCharTitleAlert").html("<span class='alert-danger'>ALERT - Title is Wrong!</span>");
        validate = false;
    }

    if (Number.isInteger(newCharLevel)) {
        if (newCharLevel < 0 || newCharLevel > 100) {
            $("#newCharLevelAlert").html("<span class='alert-danger'>ALERT - Level is Wrong!</span>");
            validate = false;
        }
    } else {
        $("#newCharLevelAlert").html("<span class='alert-danger'>ALERT - Level is Wrong!</span>");
        validate = false;
    }

    if(dateToCheck instanceof Date && !isNaN(dateToCheck.getFullYear())){
        if(dateToCheck.getFullYear() < 2000 || dateToCheck.getFullYear() > 3000) {
            $("#newCharBirthdayAlert").html("<span class='alert-danger'>ALERT - Year is Wrong!</span>");
            validate = false;
        }
    } else {
        $("#newCharBirthdayAlert").html("<span class='alert-danger'>ALERT - Year is Wrong!</span>");
        validate = false;
    }

    return validate;
}
//Функция очистки label с ошибками при редактировании персонажа.
function clearAlertsEdit(){
    $("#editAlertName").html("");
    $("#editAlertTitle").html("");
}
//Функция очистки label с ошибками при создании персонажа.
function clearAlerstForm() {
    $("#newCharNameAlert").html("");
    $("#newCharTitleAlert").html("");
    $("#newCharLevelAlert").html("");
    $("#newCharBirthdayAlert").html("");
}
//Функция очистки формы при создании нового персонажа.
function clearForm(){
    $("#newCharName").val("");
    $("#newCharTitle").val("");
    $("#newCharRaceSelect").val("HUMAN");
    $("#newCharProfessionSelect").val("WARRIOR");
    $("#newCharLevel").val("");
    $("#newCharBirthday").val("");
    $("#newCharBanned").val("false");
}