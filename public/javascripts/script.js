(function(){
function addLesson(ttdom,start_time,end_time,rowheight,top)
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

    var lessondiv = $("<div></div>");
    lessondiv.addClass("lessondiv");
    lessondiv.append($("<span></span>").text(start_time).addClass("start_time"));
    $(".lessondiv > .start_time").css('width', 80);
    ttdom.append(lessondiv);
    setDimensions(lessondiv,start_top,height);
}
function setDimensions(div,top,p_height)
{
    div.css("width","100%");
    div.css("height", p_height);
    div.css("top",top);
}
$(document).ready(function(){
    var ttdiv = $("#lessonsarea");
    //var content_cell_left $("#timetable > #08").offset().left;
    //alert(content_cell_left);
    $("#lessonsarea").height($("#headers").height());
    $.ajax({
        url: '/lessons/test',
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
                    addLesson(ttdiv,lesson.start_time,lesson.end_time,rowheight,ttdiv.offset().top);
                }
            }
        }
    });
});
})();