var statlist1 = [];
var statlist2 = [];
var statlist3 = [];
var statlist4 = []
var statlist5 = []
var statlist6 = []
var statarray = [statlist1, statlist2, statlist3, statlist4, statlist5, statlist6];

var marklist1 = [];
var marklist2 = [];
var marklist3 = [];
var marklist4 = [];
var marklist5 = [];
var marklist6 = [];
var markarray = [marklist1, marklist2, marklist3, marklist4, marklist5, marklist6 ];

function checkStation(){
    
    str=document.getElementById('statfile').value.toUpperCase();
    suffix1=".JPG";
    suffix2=".JPEG";
    suffix3=".PNG";
    suffix4=".MOV"; // add filetypes here

    if(!( str.indexOf(suffix1, str.length - suffix1.length) !== -1 || // and here

	  str.indexOf(suffix2, str.length - suffix2.length) !== -1 ||
	  str.indexOf(suffix3, str.length - suffix3.length) !== -1 ||
	  str.indexOf(suffix4, str.length - suffix4.length) !== -1 ))
    {
        alert('File type not allowed,\nAllowed file: *.jpg,*.jpeg,*.png,*.mov');
        document.getElementById('statfile').value='';
    }
    else
    {
        var index = document.getElementById('statlist').value;
        add_li("statul", str, statarray[index-1]);
    }
}


function checkMarker(){

    str=document.getElementById('markfile').value.toUpperCase();
    suffix1=".OBJ";    // add filtypes here

    if(!( str.indexOf(suffix1, str.length - suffix1.length) !== -1 )) // and here
    {
        alert('File type not allowed,\nAllowed file: *.obj');
        document.getElementById('markfile').value='';
    }
    else
    {
        var index = document.getElementById('marklist').value;
        add_li("markul", str, markarray[index-1]);
    }
}

function dropdown(name) {

    var list = document.getElementById(name);

    if(list.length > 0)     // if not empty, null the list, and recreate it
    {
        list.option[0] = null;
    }

    for(var i = 1; i <= 6; i++)  // change
    {
        var option = document.createElement("option");
        option.text = i.toString();
        option.value = i;

        try
        {
            list.add(option, null); //Standard
        }
        catch(error)
        {
            list.add(option); // Internet Explorer only
        }
     }
}

function add_li(list, name, array) {
    array.push("<input type='checkbox' onclick='isChecked(this)' class='unchecked'>" + name);
    printarray(list);
}

function isChecked(elem)
{
    if (elem.className == "unchecked")
    {
        elem.className = "checked";
    }
    else
    {
        elem.className = "unchecked";
    }
}

function printarray(listname) {

    var list = document.getElementById(listname);
    var array = getarray(listname);

    if(list){
        while(list.firstChild){
            list.removeChild(list.firstChild); // clear list
        }
    }

    for(var i = 0; i < array.length; ++i) {
        var li = document.createElement("li");
        var div = document.createElement("div");
        div.innerHTML = array[i];
        li.appendChild(div);
        list.appendChild(li);
    }
}


function getarray(listname){

    var array = [];

    if (listname == "statul")
    {
        var choosen = document.getElementById('statlist').value;
        array = statarray[choosen-1];
    }
    else if (listname == "markul")
    {
        var choosen = document.getElementById('marklist').value;
        array = markarray[choosen-1];
    }
    else
    {
        alert("Something went wrong, you idiot....");
        return -1;
    }

return array;

}

function statoption() {

    var array = getarray("statul");

    for(var )


}