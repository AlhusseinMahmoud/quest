$(document).ready(function () {

    var responses = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0, q8: 0, q9: 0, q10: 0, q11: 0, q12: 0, q13: 0, q14: 0, q15: 0, q16: 0, q17: 0, q18: 0, q19: 0, q20: 0 };
    var valid = {name: false, q: false};
    var questions = {};

    $.ajax({
        type: "GET",
        url: "http://192.168.2.224:3000/quest",
        dataType: "html",
        // crossDomain:true,
        success: function (res) {
            res = $.parseJSON(res);
            let html = '';
            $.each(res, (index, row) => {
                // console.log(row);
                questions[`q${row.id}`] = row.text;
                html += `<div class="question my-3"> <span class="q${row.id} text-primary">${row.text}${scales(row.id)}</span></div>`;
            });
            html += `<hr/><div class="row">
                    <span class="align-top col-3">مقترحات لتحسين مستوى الإنتاجية داخل الشركة (في حالة أكثر من واحد كل مقترح في سطر جديد):</span>
                    <textarea rows="4" id="sugg" class="col-6"></textarea>
                    </div>
                    <hr />
                    <button id="submit" type="button" class="form-control btn btn-primary">إرسال</button>
                    `;
            $("#questions").html(html);
        }
    }); //Ajax get questions
    var name = '';
    $(document).on('blur', "#empid", function () {
        if ($("#empname").hasClass("alert-danger")) $("#empname").removeClass("alert-danger");
        let id = $(this).val();
        if (id == '') id = 0;
        let url = "http://192.168.2.224:3000/emp/" + id;
        console.log(url);
        $.ajax({
            url,
            type: "GET",
            crossDomain: true,
            success: data => {
                let tmp = '';
                if (data == "exists") {
                    if (!$("#empname").hasClass("alert-danger")) $("#empname").addClass("alert-danger");
                    tmp = 'هذا الرقم قام بتعبئة الإستبيان من قبل,,, شكراً';
                    valid.name = false;
                    //$("#submit").prop("disabled", "true");
                }
                else {
                    tmp = 'رقم الموظف غير صحيح';
                    if (data.name == null) {
                        valid.name = false;
                        //$("#submit").prop("disabled", "true");
                        if (!$("#empname").hasClass("alert-danger")) $("#empname").addClass("alert-danger");
                    } else {
                        if (data.name) tmp = data.name;
                        name = tmp;
                        if (data.dir) tmp += ': ' + data.dir
                        valid.name = true;
                    }
                }
                $("#empname").html(tmp);
            }
        });
    });

    $(document).on("click", "span", function () {
        let i = $(this);
        let q = i.data("qno");
        let res = i.data("val");
        responses[q] = res; // save response
        // console.log(responses);

        let parent = i.parent(); //div that contains emojies :)
        parent.children().each(function () {
            if ($(this).hasClass("selected"))
                $(this).removeClass("selected");
        });
        i.addClass("selected");

        let qtext = parent.parent(); //console.log(qtext);
        if (qtext.hasClass("alert-danger")) qtext.removeClass("alert-danger");

        let count = 0;
        $.each(responses, function (k, v) {
            if (v == 0) {
                count++;
            }
        })
        if (count) {
            valid.q = false;
            console.log(count);
            //$("#submit").prop("disabled", "true");
        } else {
            valid.q = true;
        }

    });

    $(document).on("click", "#submit", function () {
        console.log(valid);
        $.each(responses, function (k, v) {
            if (v == 0) {
                console.log(k);
                valid.q = false;
                $("." + k).addClass("alert-danger");
            }
        });
        if (valid.q && valid.name) {
            let sugg = $("#sugg").val();
            let empid = $("#empid").val();
            if (sugg !== "") responses['sugg'] = sugg;
            if (empid !== "") responses['empid'] = empid;

            console.log(responses);
            $.ajax({
                type: "post",
                url: "http://192.168.2.224:3000/save",
                data: { all: JSON.stringify(responses) },
                success: function (data) {
                    console.log(data);
                    if(data =="done") {
                        $("span .bi").each(function() {
                            if($(this).hasClass("selected")) {
                                $(this).removeClass("selected");
                                $("#empid").val("");
                                $("#sugg").val("");
                                $("#empname").html("");
                            }
                        })
                        // alert(`شكراً ${name} تم الحفظ بنجاح`);
                        $(".jumbotron").html(`<p class="alert alert-success">شكراً ${name} تم الحفظ بنجاح<i class="bi bi-heart-fill"></i></p>`);
                        $("#questions").css('display', 'none');
                    }
                }
            }) // ajax
        }
    });

    $(document).on("click", '#rows', function() {
        $(".jumbotron").css('display', 'none');
        $.ajax({
            url: "http://192.168.2.224:3000/rows",
            type: "get",
            dataType: "json",
            success: function(rows) {
                let total = 0;
                let table = '<table class="table table-sm table-stripped"><tr><th>الإدارة</th><th>العدد</th></tr>';
                rows.forEach(elem => {
                    table += `<tr><td>${elem.gdir}</td><td>${elem.rows}</td></tr>`;
                    total += elem.rows;
                });
                table += `<tr><th>إجمــالي الإستبيانات </th><th>${total}</th></tr>`;
                table += `</table>`;
                Object.keys(responses).forEach(q => {
                    table += `UPDATE data SET ${q} = 3 WHERE ${q} > 3;<br>`;
                })
                $("#questions").html(table);
            }
        });
    });

    $(document).on("click", '#results', function() {
        $(".jumbotron").css('display', 'none');
        $.ajax({
            url: "http://192.168.2.224:3000/results",
            type: "get",
            dataType: "json",
            success: function(rows) {
                // console.log({questions, rows})
                let table = '<table class="table table-sm table-stripped"><tr><th>المعيار</th><th>نسبة الرضا</th></tr>';
                let total_sum = 0;
                Object.keys(rows).forEach(qno => {
                    let tmp = rows[qno]; //actual response avg value
                    total_sum += +tmp
                    table += `<tr><td>${questions[qno]}</td><td>${Math.round(tmp * 33.333)}%</td></tr>`;
                });
                console.log({total_sum})
                table += `<tr><th>نسبة الرضا الكلية</th><th>${Math.round(total_sum)}%</th></tr>`;
                table += `</table>`;

                $("#questions").html(table);
            }
        });
    });

    $(document).on("click", '#suggs', function() {
        $(".jumbotron").css('display', 'none');
        $.ajax({
            url: "http://192.168.2.224:3000/suggs",
            type: "get",
            dataType: "json",
            success: function(rows) {
                suggs = [];
                rows.forEach(row => {
                    console.log(row.sugg);
                    let temp = row.sugg.split('\n');
                    temp.forEach(tmp => suggs.push(tmp));
                })
                let table = '<table class="table table-sm table-stripped"><tr><th>المقترحات</th></tr>';
                suggs.forEach(elem => {
                    table += `<tr><td>${elem}</td></tr>`;
                });
                table += `</table>`;
                $("#questions").html(table);
            }
        });
    });

}) //ready


function scales(myclass) {
    return `
    <div class="scales">
        <span data-qno="q${myclass}" data-val="1" class="bi bi-emoji-angry"></span>
        <span data-qno="q${myclass}" data-val="2" class="bi bi-emoji-neutral"></span>
        <span data-qno="q${myclass}" data-val="3" class="bi bi-emoji-heart-eyes"></span>
    </div>
    `;
}