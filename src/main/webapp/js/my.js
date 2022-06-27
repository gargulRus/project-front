function getPlayers(pageNumber = null, pageSize = null) {

    let getUri;
    let row = "";
    let pagesCount;
    let pagesRow = "";

    if (pageSize == null) {
        pagesCount = Math.ceil(playersCount/3);
    } else {
        pagesCount = Math.ceil(playersCount/pageSize);
    }

    if (pageNumber == null) {
        if (pageSize == null) {
            getUri = "/rest/players";
            pageSize = 3;
        } else {
            getUri = "/rest/players?pageSize=" + pageSize;
        }
    } else {
        if (pagesCount == pageNumber) {--pageNumber;}
        getUri = "/rest/players?pageNumber=" + pageNumber + "&pageSize=" + pageSize;
    }

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
                "<td id='charBirth'>" + birthday + "</td>" +
                "<td id='charBanned'>" + banned + "</td>" +
                "<td id='btnEdit'><a href='#' class='btnEdit' data-ident='" +  id + "' >Edit</a></td>" +
                "<td id='btnDel'><a href='#' class='btnDel' data-ident='" +  id + "' >Delete</a></td>" +
                "</tr>";
            $("#account-table tbody").html(row);

        }
        editClick();
        deleteClick();

    });

    if (pagesCount > 0) {
        pagesRow += "Pages: ";
        for (let i = 0; i < pagesCount; i++) {
            let page = i + 1;
            pagesRow +=
                "<a href='#' class='pageLoad' data-pageNumber='" + i + "' data-pageSize='" + pageSize+"'>" + page + "</a>";
        }
        $("#pagination p").html(pagesRow);
    }
    paginationClick();

}

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

function saveNewChar() {
    $("#saveNewChar").unbind("click");
    $("#saveNewChar").bind("click", function () {
        clearAlerst();
        let newCharName = $("#newCharName").val();
        let newCharTitle = $("#newCharTitle").val();
        let newCharRaceSelect = $("#newCharRaceSelect").val();
        let newCharProfessionSelect = $("#newCharProfessionSelect").val();
        let newCharLevel = Number.parseInt($("#newCharLevel").val());
        let newCharBirthday = $("#newCharBirthday").val();
        let dateToCheck = new Date(newCharBirthday);
        let newCharBanned = $("#newCharBanned").val();

        if (!validateForm(newCharName, newCharTitle, newCharLevel, dateToCheck)) {
            return false;
        }
        let dateToMilisec = Date.parse(newCharBirthday);
        let jsonToServer = {
            name:newCharName,
            title:newCharTitle,
            race:newCharRaceSelect,
            profession: newCharProfessionSelect,
            birthday: dateToMilisec,
            level: newCharLevel,
            banned:newCharBanned
        };

        let pageNumber = $("#pageNumberHidden").val();
        let pageSize = $("#pageSizeHidden").val();

        $.ajax({
            type: "POST",
            url: "/rest/players",
            cache: false,
            async: false,
            data: JSON.stringify(jsonToServer),
            contentType:"application/json; charset=utf-8",
            dataType: "json",
            success: function () {
                clearForm();
                getPlayersCount();
                let pagesCount = Math.ceil(playersCount/pageSize);
                if ((pagesCount - pageNumber) == 2) {
                    ++pageNumber;
                } else if ((pagesCount - pageNumber) > 2) {
                    pageNumber = pagesCount - 1;
                }
                getPlayers(pageNumber, pageSize);
            }
        });
    });
}

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
                console.log("Отправляю запрос на " + getUri );
                console.log("Вызываю getPlayers");
                getPlayersCount();
                getPlayers(pageNumber, pageSize);
            }
        });
    });
}

function editClick() {
    $("#characteRow > #btnEdit a").unbind("click");
    $("#characteRow > #btnEdit a").bind("click", function () {
        let row = $(this).closest("tr");
        let charId = row.children("td").eq(0);
        let charName = row.children("td").eq(1);
        let charTitle = row.children("td").eq(2);
        let charRace = row.children("td").eq(3);
        let charProf = row.children("td").eq(4);
        let charBanned = row.children("td").eq(7);
        let btnEdit = row.children("td").eq(8);
        let btnDel = row.children("td").eq(9);

        let selectRace = genereateSelectRace();
        let selectProfession = genereateSelectProfession();
        let selectBanned = genereateSelectBanned();

        let charIdData = charId.html();
        let charNameData = charName.html();
        let charTitleData = charTitle.html();
        let charRaceData = charRace.html();
        let charProfData = charProf.html();
        let charBannedData = charBanned.html();

        charName.html("<input type='text' id='charName' size='5' name='charName' value='"+ charNameData +"'>");
        charTitle.html("<input type='text' id='charTitle' name='charTitle' value='"+ charTitleData +"'>");
        charRace.html(selectRace);
        charRace.find("#raceSelect").val(charRaceData);
        charProf.html(selectProfession);
        charProf.find("#professionSelect").val(charProfData);
        charBanned.html(selectBanned);
        charBanned.find("#bannedSelect").val(charBannedData);
        btnEdit.html("<a href='#' class='btnSave' id='btnSave' >Save</a>");
        let btnSave = btnEdit.find("#btnSave");
        btnDel.html(" ");

        $(btnSave).unbind("click");
        $(btnSave).bind("click", function () {

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
                    console.log("Отправляю запрос на " + getUri );
                    console.log("Вызываю getPlayers");
                    getPlayersCount();
                    getPlayers(pageNumber, pageSize);
                }
            });
        });

    });
}
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
function genereateSelectBanned() {
    let select;
    select = "" +
        "<select id='bannedSelect'>" +
        "<option value='false'>false</option>" +
        "<option value='true'>true</option>" +
        "</select>";

    return select;
}

function validateForm(newCharName = null, newCharTitle = null, newCharLevel = null, dateToCheck = null,) {
    let validate = true;

    if (newCharName.length < 1 || newCharName.length > 12) {
        $("#newCharNameAlert").html("<span>ALERT - Name is Wrong!</span>");
        validate = false;
    }
    if (newCharTitle.length < 1 || newCharTitle.length > 30) {
        $("#newCharTitleAlert").html("<span>ALERT - Title is Wrong!</span>");
        validate = false;
    }
    if (Number.isInteger(newCharLevel)) {
        if (newCharLevel < 0 || newCharLevel > 100) {
            $("#newCharLevelAlert").html("<span>ALERT - Level is Wrong!</span>");
            validate = false;
        }
    } else {
        $("#newCharLevelAlert").html("<span>ALERT - Level is Wrong!</span>");
        validate = false;
    }
    if(dateToCheck instanceof Date && !isNaN(dateToCheck.getFullYear())){
        if(dateToCheck.getFullYear() < 2000 || dateToCheck.getFullYear() > 3000) {
            $("#newCharBirthdayAlert").html("<span>ALERT - Year is Wrong!</span>");
            validate = false;
        }
    } else {
        $("#newCharBirthdayAlert").html("<span>ALERT - Year is Wrong!</span>");
        validate = false;
    }

    return validate;
}

function clearAlerst() {
    $("#newCharNameAlert").html("");
    $("#newCharTitleAlert").html("");
    $("#newCharLevelAlert").html("");
    $("#newCharBirthdayAlert").html("");
}

function clearForm(){
    $("#newCharName").val("");
    $("#newCharTitle").val("");
    $("#newCharRaceSelect").val("HUMAN");
    $("#newCharProfessionSelect").val("WARRIOR");
    $("#newCharLevel").val("");
    $("#newCharBirthday").val("");
    $("#newCharBanned").val("false");
}