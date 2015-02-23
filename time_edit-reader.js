var reader = require("./abstractreader");
headers = [
    'start_date',
    'start_time',
    'end_date',
    'end_time',
    'p1',
    'p2',
    'room',
    'title',
    'groups',
    'lecturer',
    'info'
];
reader(process.argv[2],headers);//Might not be the best solution to read files to get timetables. But I have not found API to get all timetable data. 