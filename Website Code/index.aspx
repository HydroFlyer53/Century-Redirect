

<html>
<head>
<title>Century Resources Web Store</title>
<meta property="og:url"           content="https://store.centuryresources.com/shop/index.aspx" />
<meta property="og:type"          content="website" />
<meta property="og:title"         content="Century Resources" />
<meta property="og:description"   content="Easy and Effective Fundraising" />
<meta property="og:image"         content="https://store.centuryresources.com/shop/images/facebookshare.jpg" />
<meta property="og:image:width"         content="1200" />
<meta property="og:image:height"         content="630" />
<meta name="googlebot" content="NOODP" />
<meta name="slurp" content="NOYDIR" />
<meta name="msnbot" content="NOODP" />
<meta name="description" content="Easy and Effective Fundraising" />
<meta http-equiv="Content-Type" content="text/html;" />
<link href="mainstylesheet.css" rel="stylesheet" type="text/css" />
<style type="text/css">
    .pics img { display: none }
</style>
<link rel="shortcut icon" href="images/favicon.ico" />

<script src="https://use.typekit.net/uhj7ffh.js"></script>
<script>try{Typekit.load({ async: true });}catch(e){}</script>

<script type="text/javascript" src="../Assets/js/jquery-1.8.3.min.js?v=20260914"></script>
<script type="text/javascript" src="../Assets/js/jquery.cycle.all.min.js"></script>
<script type="text/javascript">

    $(document).ready(function () {
        $('#s1').cycle({
            fx: 'fade',
            timeout: 4000,
            speed: 2500,
            delay: -2000
        });
        $('#s2').cycle({
            fx: 'fade',
            timeout: 4500,
            speed: 2500,
            delay: -2250
        });
        $('#s3').cycle({
            fx: 'fade',
            timeout: 5800,
            speed: 2500,
            delay: -2900
        });
        $('#s4').cycle({
            fx: 'fade',
            timeout: 5000,
            speed: 2500,
            delay: -2500
        });

        var ddlState = $('#ddlSchoolState');
        $.each(st, function (i) {
            ddlState.append('<option value="' + st[i].customer_state + '">' + st[i].customer_state + '</option>');
        });

        var state;
        
        $('#ddlSchoolState').bind('change', function () {
            $('#search_fields').show();
            $('#schoollist').html('');

        });

        $('.school').live('click', function (e) {
            e.preventDefault();
            var schoolOrderNum = $(this).attr('schoolOrderNum');

            $.ajax({
                type: "POST",
                url: "index.aspx/getSchoolInfo",
                data: '{ schoolOrderNum : "' + schoolOrderNum + '"}',
                cache: false,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (msg) {
                    console.log(msg)
                    var objArray = $.parseJSON(msg.d);
                    var schoolObj = objArray[0];

                    $('#schoolOrderNum').html(schoolOrderNum);
                    $('#schoolName').html(schoolObj.groupname);
                    $('#schoolAdd1').html(schoolObj.customer_address1);
                    if (schoolObj.customer_address2 !== '') {
                        $('#schoolAdd2').html(schoolObj.customer_address2 + '<br />');
                    }
                    $('#schoolCity').html(schoolObj.customer_city);
                    $('#schoolState').html(schoolObj.customer_state);
                    $('#schoolZip').html(schoolObj.customer_zip);

                    $('#schoolTable').hide();
                    $('#mainTable').fadeIn();
                    $('#errortext').hide();
                    
                }
            });
        });
        var badwords=["2019","2020","2021","2022","10th","11th","12th","4th","5th","6th","7th","8th","9th","afjrotc","afrotc","ajrotc","archery","art","athletics","avid","band","band booster","band boosters","bands","baseball","basketball","booster","boosters","bowling","boys","business","camp","cheer","cheer team","cheerleader","cheerleaders","cheerleading","choir","choir booster","choir boosters","choral","chorus","class","club","d.c trip","dance","debate","deca","department","dept","dept.","drama","drill","drill team","eighth","elem","elementary","fbla","fccla","fcs","ffa","football","fresh","freshman","girls","group","guard","high","honors","hs","instrumental","jazz","jhs","jr","jr.","jrotc","junior","jv","language","leadership","little league","marching","mc jrotc","mcjrotc","mens","middle","ms","music","music boosters","music department","nhs","njhs","njrotc","orchestra","performing","pom","pom pon","pompon","poms","preschool","program","pto","rotc","school","school wide","senior class","senior trip","seventh","sixth","soccer","softball","soph","sophomore","spanish","spirit","step","team","total","trip","tsa","tsp","varsity","volleyball","washington dc","washington dc trip","womens","wrestling","yearbook","youth"];

        $('#txtGroupID').bind('keyup', function () {
            var num = $(this).val();
            retrieveGroupsbyNumber(num);
        });

        $('#search_button').click(function () {
            $('#schoollist').html('');
            $(".header-table").hide();
            var search_term=$('#search_box').val();

            if (search_term.trim()=='' || search_term.length<3) {
                $('#schoollist').html('<span class=whitetext>Please enter a search term.</span>');
            }
            else {
                var n=$.inArray(search_term.toLowerCase(),badwords);;
 
                if (n>-1) {
                    $('#search_box').val('');
                }
                else {
                    retrieveGroups();
                }
            }
        });
    });

    function retrieveGroups() {

        var state=$('#ddlSchoolState').val();
        var search_term=$('#search_box').val();

        $.ajax({
            type: "POST",
            url: "index.aspx/retrieveGroups",
            data: '{ search : "' + state + '|' + search_term + '", type : "city"}',
            cache: false,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                if (data.d=='') {
                    $('#schoollist').html('<span class=whitetext>No groups were found.  Please try again.</span>');
                }
                else {
                    $(".header-table").show();
                    $('#schoollist').html(data.d);
                }
            }
        });
    }

    var t;
    function retrieveGroupsbyNumber(num) {
        clearTimeout(t);
        if (num !== '') {
            t = setTimeout(function () {
                $.ajax({
                    type: "POST",
                    url: "index.aspx/retrieveGroups",
                    data: '{ search : "' + num + '", type : "groupID"}',
                    cache: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        $(".header-table").show();
                        $('#schoollist').html(data.d);
                    }
                });
            }, 750);
        }
    }

    function checkSpecial(e) {
        var k;
        document.all ? k = e.keyCode : k = e.which;
        return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
    }
</script>
<script language="JavaScript">
    function disableEnterKey(e)
    {
        var key;

        if(window.event)
            key = window.event.keyCode;     //IE
        else
            key = e.which;     //firefox

        if(key == 13)
            return false;
        else
            return true;
    }

    function showGroupDisclaimer() {
        $("#group_disclaimer").show();
    }

    function closeGroupDisclaimer() {
        $("#group_disclaimer").hide();
    }

    function showStudentDisclaimer() {
        $("#student_disclaimer").show();
    }

    function closeStudentDisclaimer() {
        $("#student_disclaimer").hide();
    }


</script>
</head>
<body onKeyPress="return disableEnterKey(event)">
<form name="form1" method="post" action="./index.aspx" id="form1">
<div>
<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="/wEPDwUKLTYwMjA1Mjk3Ng9kFgICAQ9kFgICBQ8WAh4HVmlzaWJsZWhkZCZsDS+J5woRGvEj842PTUl16Hskn3aU7smTMpb2lE1j" />
</div>

<div>

	<input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="A432A83E" />
</div>

<div id="container">
	<div id="preheader">
		<div id="social">
			<a href='https://twitter.com/CenturyResource' target='_blank'><img src="/shop/images/twitter.gif" height="13px"></a>
            <a href='https://www.facebook.com/centuryresource/' target='_blank'><img src="/shop/images/facebook.png" height="13px"></a>
            <a href='https://www.instagram.com/centuryresources/' target='_blank'><img src="/shop/images/instagram.png" height="13px"></a>
		</div>
	</div>
	<div id="header">
		<div class="leftheader">
			<a href="/"><img src="images/logo.png" style="border:0px;" /></a>
        </div>
        <div ID="rightheader">

        </div>
    </div>
		
	<div id="main">
		<div class="overlay"></div>
			<div id="content">
                <div id="headertext">
                    <h2>SHOP THE CENTURY STORE</h2>
                    <h2>Or, Make a Donation!</h2>
                </div>
                
				<table id="schoolTable" cellspacing="5" cellpadding="5" width="100%">
	<tr>
		<td class="whitetext" align="center">
                            Select the group you're supporting by entering their ID or look them up by state!
                        </td>
	</tr>
	<tr>
		<td class="whitetext" align="center">
                            Enter their ID:
                        </td>
	</tr>
	<tr>
		<td class="whitetext" align="center">
                            Group ID: <input type="text" id="txtGroupID" />
                        </td>
	</tr>
	<tr>
		<td align="center" class="bigtext whitetext">
                            OR
                        </td>
	</tr>
	<tr>
		<td class="whitetext" align="center">
                            Select the state they are located in:
                        </td>
	</tr>
	<tr>
		<td valign="top" align="center">
                            <table cellpadding="5" cellspacing="5" border="0" width="50%">
                                <tr>
                                    <td align=center colspan=2>
                                        <select id="ddlSchoolState" class="bigger-select"><option>Pick a State...</option></select>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan=2 align=center>
                                        <div id="search_fields" style="display:none;">
                                            <input type="text" id="search_box" name="search_box" placeholder="Enter school name to search for your group." size='50'><br><br>
                                            <button id="search_button" name="search_button" type="button">Search</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr class="header-table">
                                    <td style="width:240px;" class="whitetext">
                                        Group
                                    </td>
                                    <td style="width:96px;" class="whitetext">
                                        Group ID
                                   </td>
                                </tr>
                            </table>                     
                            <div id="schoollist" style="height:200px; overflow:auto;">&nbsp;</div>
                        
                        </td>
	</tr>
</table>

                 
                <table id="mainTable" style="display:none;" align="center" width="100%">
	<tr>
		<td colspan="2" style="text-align:center;">
                        <h3 class="whiteheader">Group's Fund Raiser Info:</h3>
                        </td>
	</tr>
	<tr>
		<td align="right" class="whitetext" valign="top" width="50%">Group ID:&nbsp;&nbsp;</td>
		<td align="left" class="whitetext">
                            <span id="schoolOrderNum" style="color:White;"></span></td>
	</tr>
	<tr>
		<td align="right" class="whitetext" valign="top">School Name:&nbsp;&nbsp;</td>
		<td align="left" class="whitetext">
                            <span id="schoolName" style="color:White;"></span></td>
	</tr>
	<tr>
		<td align="right" class="whitetext" valign="top">School Address:&nbsp;&nbsp;</td>
		<td align="left" class="whitetext">
                            <span id="schoolAdd1" style="color:White;"></span><br />
                            <span id="schoolAdd2" style="color:White;"></span>
                            <span id="schoolCity" style="color:White;"></span>, 
                            <span id="schoolState" style="color:White;"></span>&nbsp;
                            <span id="schoolZip" style="color:White;"></span></td>
	</tr>
	<tr>
		<td colspan="2" class="whitetext" align="center">
                        Please enter the Student's name so they get credit for your purchase:
                    </td>
	</tr>
	<tr>
		<td align="right" class="whitetext">Student's Name&nbsp;&nbsp;</td>
		<td align="left"> <input name="student_namef" type="text" id="student_namef" onkeypress="return checkSpecial(event)" placeholder="First Name" required="" pattern=".*\S+.*" />&nbsp;<input name="student_namel" type="text" id="student_namel" onkeypress="return checkSpecial(event)" Placeholder="Last Name" required="" pattern=".*\S+.*" /></td>
	</tr>
	<tr>
		<td colspan="2" align="center">
                        <input type="submit" name="btnWStudent" value="Save Student &amp; Shop" id="btnWStudent" class="action-button" /><br />
                    </td>
	</tr>
	<tr>
		<td colspan="2" class="smallwhitetext" align="center">
                                <p>Not shopping for a specific student but want to support the group?</p>
                                <p>Click <a href='#' onclick="showStudentDisclaimer();">here</a> to shop without crediting a student.</p>
                        </td>
	</tr>
</table>

			</div>
            <div id="group_disclaimer">
                Your purchase will not be applied to a group or student and no changes can be made once the purchase is completed.<br>
                Click the "Go Back" button to return to the group selection page or click "Continue" to continue with your order.<br>
                <input type="button" class="redbutton" value="Go Back" onclick="closeGroupDisclaimer();">
                <input type="button" class="redbutton" value="Continue" onclick="window.location.href='shopping.aspx?reset=1';">
            </div>
            <div id="student_disclaimer">
                Your purchase will not be applied to a student and no changes can be made once the purchase is completed.<br>
                Click the "Go Back" button to enter a student's name or click "Continue" to continue with your order.<br>
                <input type="button" class="redbutton" value="Go Back" onclick="closeStudentDisclaimer();">
                <input type="button" class="redbutton" value="Continue" onclick="window.location.href='shopping.aspx?reset=1';">
            </div>
		</div>
	
		<div id="footer">
			<ul>
				<li class="nav-item"><a href="https://www.centuryresources.com/get-started/">Start a Fundraiser</a></li>
				<li class="nav-item"><a href="https://store.centuryresources.com/shop/index.aspx">Shop a Fundraiser</a></li>
				<li class="nav-item"><a href="https://www.centuryresources.com/my-current-fundraiser/">My Current Fundraiser</a></li>
				<li class="nav-item"><a href="https://www.centuryresources.com/work-for-century-resources/">Start a Career at Century</a></li>
				<li class="nav-item"><a href="https://www.centuryresources.com/contact-us/">Contact Us</a></li>
				<li class="nav-item"><a href="https://www.centuryresources.com/blog/">Blog</a></li>
			</ul>
		</div>
</div>


<script type="text/javascript">
//<![CDATA[
var st = [{"customer_state":"AL"},{"customer_state":"AR"},{"customer_state":"GA"},{"customer_state":"IA"},{"customer_state":"IL"},{"customer_state":"IN"},{"customer_state":"KS"},{"customer_state":"KY"},{"customer_state":"MI"},{"customer_state":"MN"},{"customer_state":"MO"},{"customer_state":"NC"},{"customer_state":"NJ"},{"customer_state":"NM"},{"customer_state":"NY"},{"customer_state":"OH"},{"customer_state":"OK"},{"customer_state":"PA"},{"customer_state":"TN"},{"customer_state":"TX"},{"customer_state":"WI"},{"customer_state":"WV"}];//]]>
</script>
</form>
</body>
</html>
