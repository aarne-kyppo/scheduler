(function(){
/*Yes. I know that code below is painful to read.
 *Lesson component will be made with Angular.js in the future.*/
var all_lessons = [];
function addLesson(ttdom,rowheight,top,start_time,end_time,title,lecturer,groups,room)
{
    var start = start_time.split(":");
    console.log("start_time = " + start_time);
    var startfraction = parseFloat(rowheight)*(parseFloat(start[1])/60.0);
    console.log("startfraction = " + parseFloat(start[1])/60.0);
    var start_top = $("#" + start[0]).offset().top + startfraction-top;

    var end = end_time.split(":");
    var endfraction = rowheight*(parseFloat(end[1])/60);
    console.log(endfraction);
    var start_bottom = $("#" + end[0]).offset().top + endfraction-top;
    var height = start_bottom-start_top;
    console.log("top = " + top);
    console.log("start_top = " + start_top);
    console.log("start_bottom = " + start_bottom);

    $(".lessondiv > .start_time").css('width', 80);
    var lessondiv = generate_lesson_div(start_time,end_time,title,lecturer,groups,room);
    ttdom.append(lessondiv);
    setDimensions(lessondiv,start_top,height);
    return lessondiv;
}
function setDimensions(div,top,p_height)
{
    div.css("width","100%");
    div.css("height", p_height);
    div.css("top",top);
}
function generate_lesson_div(start_time, end_time, title, lecturer, groups, room)
{
    var lessondiv = $("<div></div>").addClass("lessondiv");
    var startdiv = $("<div></div>").addClass("start_time_block");
    var contentdiv = $("<div></div>").addClass("content_block");
    var enddiv = $("<div></div>").addClass("end_time_block");
    
    lessondiv.append(startdiv);
    lessondiv.append(contentdiv);
    lessondiv.append(enddiv);
    
    startdiv.append($("<p></p>").text(start_time).addClass("start_time"));
    contentdiv.append($("<p></p>").text(title));
    contentdiv.append($("<p></p>").text(room));
    contentdiv.append($("<p></p>").text(lecturer.join(', ')));
    contentdiv.append($("<p></p>").text(groups.join(', ')));
    enddiv.append($("<p></p>").text(end_time).addClass("end_time"));
    
    return lessondiv
}
function request_lessons(url)
{
    var ttdiv = $('#lessonsarea');
    $.ajax({
        url: url,
        success: function(lessons){
            if(lessons)
            {
                var rowheight = $("#08").height();//Dont read this :D
                if(!lessons instanceof Array)
                {
                    lessons = [lessons,];
                }
                else if(typeof lessons == 'Array')
                {
                    console.log("Many lessons today. Hooray!");
                }
                console.log(lessons);
                for(var i=0;i<lessons.length;i++)
                {
                    var lesson = lessons[i];
                    all_lessons.push(addLesson(ttdiv,rowheight,ttdiv.offset().top,lesson.start_time,lesson.end_time,lesson.title,lesson.lecturer,lesson.groups,lesson.room));
                }
            }
        }
    });
}
$(document).ready(function(){
    var ttdiv = $("#lessonsarea");
    var rooturl = $('#rooturl').text();
    
    $("#lessonsarea").height($("#headers").height());
    var group = $('#groupselector option:selected').val();
    request_lessons(rooturl + '/lessons/json/group/' + group);
    $('#groupselector').change(function(){
        all_lessons.forEach(function(elem){
            elem.remove();
        });
        all_lessons = [];
        all_lessons.length = 0;
        $('#groupselector option:selected').each(function(){
            $('#groupform').submit();
        });
    });
});
})();