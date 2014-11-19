window.addEventListener("load", init);
function init () {
	setListener();
};

function setListener(){
	var conclude_button = document.getElementById("conclude");
	var premise_button = document.getElementById("premise");
	var assumption_button = document.getElementById("assumption");
	var undo_button = document.getElementById("undo");

	//conclude按钮被单击
	conclude_button.addEventListener("click", function() {
	    var expr = expression.value.split("#");
	    if (expr[1].search(builtin_rules["=>I"].name) !== -1) {
	        addNewExpression(expr[0], "Discharge", expr[1]);
	    } else {
	        addNewExpression(expr[0], "Rule", expr[1]);
	    }
	   clear_button.dispatchEvent(new Event('click'));
	   resetSelection();
	});

	//premise按钮被单击
	premise_button.addEventListener("click", function () {
	    addNewExpression(expression.value, "Premise");
	});

	//assumption按钮被单击
	assumption_button.addEventListener("click", function () {
	    addNewExpression(expression.value, "Assumption");
	});

	//undo按钮被单击
	undo_button.addEventListener("click", undo);
};