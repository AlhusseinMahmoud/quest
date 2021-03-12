$(document).ready(function() {

    console.log("KHALID");
    let form = '';
    let loggedIn = false;
    let pass = '1234567';
    if(!loggedIn) {
        form = $("#compdata").html();
        $("#compdata").html(`<div id="login" class="row mt-4"><input type="password" class="form-control col-6" id="key" placeholder="كلمة المرور" /><button id="en" class="form-control col-2">دخول</button></div>`);
        // console.log(form);
        localStorage.setItem('pass', pass)
    } else {
        $("#compdata").html(form);
    }

    $(document).on("click", "#save", function() {
        let name = $("#name").val();
        let phone = $("#phone").val();
        let type = $("input[name=type]:checked").val();
        let status = $("input[name=status]:checked").val();
        let address = $("#address").val();
        console.log({name, phone, type, address, status});
        $.ajax({
            url: "http://192.168.2.224:3001/save",
            type: "post",
            data: {type, status, name, phone, address},
            success: function(result) {
                console.log(result.affectedRows);
                $("#name").val('');
                $("#phone").val('');
                $("#address").val('');
            }
        })
    });

    $(document).on('click', '#en', function() {
        let pass = localStorage.getItem('pass');
        if(pass == $("#key").val()) {
            $("#compdata").html(form);
        } else {
            alert("Wrong");
        }
    });

    $(document).on("click", "#addLink", function() {
        $("#compdata").html("AddLink is clicked");
    });

    $(document).on('keydown', '#phone', function(e){
        let keyCode = e.keyCode;
        let temp = '';
        let count = 0;
        let phones = [];
        if(keyCode < 106 && keyCode > 96) {
            temp += char(keyCode);
            if(temp.length == 10) {
                phones.push(temp);
                temp = '';
            }
        } else {
            console.log(temp);
        }
        console.log(phones);
    });

});