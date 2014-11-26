var cur_scope = [];
var cur_scope_lid = 1;
var cur_area;   //装表达式的显示表

var expressions_list = {};  //存储所有的表达式
var selections_list = {};
var actionsStack = [];

var undo_button;    //撤销按钮
var summary_box;
var message_box;

var current_conclusion = [];

//当单击了premise,assumption和conclude按钮都会触发
function addNewExpression(content, type, rule_name) {
    // Create new expression object and add to expressions list
    content = beautify(parse(trim(content).split(""), 0));
    var prev_scope = cur_scope.slice(0);
    var prev_line_id = cur_scope_lid;
    
    if (rule_name && rule_name.search(builtin_rules["=>I"].name) !== -1) {
        cur_scope_lid = cur_scope.pop() + 1;
        cur_area = document.getElementById(getPrefixedScopeId(cur_scope));
    }
    var scope_id = cur_scope.join(".");
    var newExpr = new Expression((scope_id ? scope_id + "." : "") + cur_scope_lid, content, type, rule_name);
    //var newExpr = new Expression("" + cur_scope_lid, content, type, rule_name);

    expressions_list[EXPR_PREFIX + newExpr.identifier] = newExpr;

    actionsStack.push({ "name": "add_expression",
                        "target": EXPR_PREFIX + newExpr.identifier,
                        "scope": prev_scope,
                        "line": prev_line_id });
    
    //Create new DOM list item for the expression
    var expr_el = document.createElement("div");
    var expr_str = document.createElement("span");
    var expr_mod = document.createElement("span");
    expr_el.className = EXPR_ITEM_CLASS_NAME;
    expr_el.id = EXPR_PREFIX + newExpr.identifier;
    expr_str.innerHTML = newExpr.content;
    expr_str.className = EXPR_STRING_CLASS_NAME;
    expr_mod.innerHTML = getModifier(type, rule_name);
    expr_mod.className = EXPR_MODIFIER_CLASS_NAME + " " + type;
    expr_el.appendChild(expr_str);
    expr_el.appendChild(expr_mod);
    cur_area.appendChild(expr_el);  //给表格加上新的表达式
    
    //Update current scope, line id in case of assumption
    //discharge or premise. DOM ordered list for the scope is also created or updated
    if (type == "Assumption") {
        cur_scope.push(cur_scope_lid);
        cur_scope_lid = 1;
        
        var sub_area = document.createElement("ol");
        sub_area.id = getPrefixedScopeId(cur_scope);
        cur_area.appendChild(sub_area);
        cur_area = sub_area;
        actionsStack.push({ "name": "add_scope",
                            "target": sub_area.id});
    } else {
        cur_scope_lid++;
    }
    
    if ((undo_button.disabled)) {
        undo_button.disabled = false;
    }
}

//item: DOM li element
function toggleSelection(item) {
    if (item.className == "expression_content") {
    item.className = "expression_content_selected";
    selections_list[item.id] = expressions_list[item.id];
    } else {
    item.className = "expression_content";
    delete selections_list[item.id];
    }
}

function resetSelection() {
    for (expr_id in selections_list) {
        var expr_item = document.getElementById(expr_id);
        toggleSelection(expr_item);
    }
}

// Event handler when a rule item is clicked
// return [conclusion, modifier] if exists or "" otherwise
function ruleSelected(rule) {
    var dependencies = [];
    var expression_strs = [];
    
    //判断每个表达式是不是都能看到
    for (var expr_id in selections_list) {
        expression = selections_list[expr_id];
        if (!expression.canBeSeen(cur_scope)) {
            return INVALID_SCOPE;
        }
        expression_strs.push(expression.content);
        dependencies.push(expression.identifier);
    }
    
    //判断参数数量是否正确
    if (expression_strs.length < rule.premises.length)
        return INVALID_MATCH_QUANTITY;
    //判断是不是由assum引入推出
    if (rule.name == builtin_rules["=>I"].name) {
        var discharge = expression_strs.join("|-");
        expression_strs = [discharge];
    }
    
    var conclusion = matchWithRule(expression_strs, rule);
    if (conclusion) {
        var modifier = rule.name + "  ";
        return [rule.substitute(conclusion), modifier + dependencies.join(", ")];
    } else {
        return INVALID_MATCH_QUALITY;
    }
}

//Event handler when a mouseover a rule
function ruleQuery(rule) {
    var sum_content = rule.name + "<br>" +
                      "{ " + rule.uncompiled_premises.join(", ") + " }" +
                      " |- " + "{ " + beautify(rule.conclusion) + " }";
    summary_box.innerHTML = sum_content;
}

function undo() {
    function removeExpression(expr_id) {
        delete expressions_list[expr_id];
        var removedExpr = document.getElementById(expr_id);
        removedExpr.parentNode.removeChild(removedExpr);
    }
    
    resetSelection();
    var previous_action = actionsStack.pop();
    if (previous_action.name == "add_expression") {
        removeExpression(previous_action.target);
        cur_scope = previous_action.scope;
        cur_scope_lid = previous_action.line;
        cur_area = document.getElementById(getPrefixedScopeId(cur_scope));
    } else if (previous_action.name == "add_scope") {
        var removedScope = document.getElementById(previous_action.target);
        removedScope.parentNode.removeChild(removedScope);
        undo();
    }
    
    if (actionsStack.length == 0) {
        undo_button.disabled = true;
    }
}

function addRule(id, rule) {
    var rule_box = document.getElementById("rules_box");
    var rule_button = document.createElement("input");
    
    builtin_rules[id] = builtin_rules[id] || rule;
    rule_button.type = "button"; rule_button.value = rule.name;
    rule_button.id = id;
    rule_box.appendChild(rule_button);
}

//页面初始化函数
function init() {
    cur_area = document.getElementById("scope_0");  //cur_area显示当前状态
}


//Called when the page loads, set listeners for all components
function setupListeners() {
    //给各个组件加上listener
    var premise_button = document.getElementById("premise");
    var assumption_button = document.getElementById("assumption");
    var clear_button = document.getElementById("clear");
    var conclude_button = document.getElementById("conclude");
    undo_button = document.getElementById("undo");
    var print_button = document.getElementById("printable");
    var add_rule_button = document.getElementById("add_rule");
    var add_button = document.getElementById("add");
    var cancel_add_button = document.getElementById("cancel_add");
    var reset_button = document.getElementById("reset");
    
    var expression = document.getElementById("expression"); //
    var message = document.getElementById("message");
    
    var main_scope = document.getElementById("scope_0");
    
    var rules_box = document.getElementById("rules_box");
    summary_box = document.getElementById("summary");
    message_box = document.getElementById("message");
    
    //当单击了premise按钮
    premise_button.addEventListener("click", function () {
        addNewExpression(expression.value, "Premise");
    });
    
    assumption_button.addEventListener("click", function () {
        addNewExpression(expression.value, "Assumption");
    });

    //单击了conclude按钮
    conclude_button.addEventListener("click", function() {

        /*if (!/^(\&I|\&E1|\&E2|vI1|vI2|vE|=>I|=>E|~~I|~~E)\s(\d+,)*\d+$/.test(expression.value)) {
            message_box.innerHTML = "Wrong input. The input should match the pattern. ";
            return;
        };*/
        var inputArray = expression.value.split(" ");
        var rule = builtin_rules[inputArray[0]];  //判断运用的是什么规则

        var selectedArray = inputArray[1].split(",");
        for (var i = 0; i < selectedArray.length;i++){
            var selectItem = document.getElementById("expr_" + selectedArray[i]);
            if (selectItem.className == EXPR_ITEM_CLASS_NAME ||
                selectItem.className == EXPR_ITEM_SELECTED_CLASS_NAME) {
                var selection = document.getElementById(selectItem.id);
                toggleSelection(selection);
            } else if (selectItem.className == EXPR_STRING_CLASS_NAME) {
                var selection = document.getElementById(e.target.parentNode.id);
                toggleSelection(selection);
            }
        }
        var result = ruleSelected(rule);
        
        if (result == INVALID_SCOPE) {
            message_box.innerHTML = ERROR_MESSAGE_SCOPE;
        } else if (result == INVALID_MATCH_QUALITY) {
            message_box.innerHTML = ERROR_MESSAGE_MATCH_QUALITY;
        } else if (result == INVALID_MATCH_QUANTITY) {
            message_box.innerHTML = ERROR_MESSAGE_MATCH_QUANTITY +
                                    ". Require " + rule.premises.length + " premises";
        } else if (result) {
            current_conclusion = beautify(result[0])
            expression.value = result[1];   //!!!!!!!!!!!!!!!!!!!!!!!!!
            conclude_button.disabled = false;
            premise_button.disabled = true;
            assumption_button.disabled = true;
            //message_box.innerHTML = "";
        }

        //原始的conclude内容
        var expr = [current_conclusion,expression.value];
        if (expr[1].search(builtin_rules["=>I"].name) !== -1) {
            addNewExpression(expr[0], "Discharge", expr[1]);
        } else {
            addNewExpression(expr[0], "Rule", expr[1]);
        }
       resetSelection();
    });
    
    
    main_scope.addEventListener("click", function(e) {
        if (e.target.className == EXPR_ITEM_CLASS_NAME ||
            e.target.className == EXPR_ITEM_SELECTED_CLASS_NAME) {
            var selection = document.getElementById(e.target.id);
            toggleSelection(selection);
        } else if (e.target.className == EXPR_STRING_CLASS_NAME) {
            var selection = document.getElementById(e.target.parentNode.id);
            toggleSelection(selection);
        }
    });
    
    undo_button.addEventListener("click", undo); 

    document.getElementById("&I").addEventListener("click",function(){
        expression.value = "&I ";
    });
    document.getElementById("&E1").addEventListener("click",function(){
        expression.value = "&E1 ";
    });
    document.getElementById("&E2").addEventListener("click",function(){
        expression.value = "&E2 ";
    });
    document.getElementById("vI1").addEventListener("click",function(){
        expression.value = "vI1 ";
    });
    document.getElementById("vI2").addEventListener("click",function(){
        expression.value = "vI2 ";
    });
    document.getElementById("vE").addEventListener("click",function(){
        expression.value = "vE ";
    });
    document.getElementById("=>I").addEventListener("click",function(){
        expression.value = "=>I ";
    });
    document.getElementById("=>E").addEventListener("click",function(){
        expression.value = "=>E ";
    });
    document.getElementById("~I").addEventListener("click",function(){
        expression.value = "~I ";
    });
    document.getElementById("~~I").addEventListener("click",function(){
        expression.value = "~~I ";
    });
    document.getElementById("~~E").addEventListener("click",function(){
        expression.value = "~~E ";
    });
}

function main() {
    init();
    setupListeners();
}


window.addEventListener("load", main);