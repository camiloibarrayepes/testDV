fs.readFile("data/wx.hourly.txt", "utf8", function(err, data){
    if(err) throw err;

    var resultArray = //do operation on data that generates say resultArray;

    res.send(resultArray);
});