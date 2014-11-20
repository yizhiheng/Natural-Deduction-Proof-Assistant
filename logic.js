/*
var builtin_rules = {
    //基本的自然推理逻辑
    "&I": new Rule("And Intro", ["A", "B"], "A & B"),
    "&I1": new Rule("And Elim 1", ["A & B"], "A"),
    "&I2": new Rule("And Elim 2", ["A & B"], "B"),
    "vI1": new Rule("Or Intro 1", ["A"], "A v B"),
    "vI2": new Rule("Or Intro 2", ["A"], "B v A"),
    "vE": new Rule("Or Elim", ["A v B", "A => C", "B => C"], "C"),
    "=>I": new Rule("Implication Intro", ["A |- B"], "A => B"),
    "=>E": new Rule("Implication Elim", ["A", "A => B"], "B"),
    "~I": new Rule("Not Intro", ["A => (B & ~B)"], "~A"),
    "~~E": new Rule("Double Not Elim", ["~~A"], "A"),
};

// Rule函数构造器
function Rule(name, premises, conclusion) {
    this.name = name;
    this.uncompiled_premises = premises;
    this.premises = premises.slice(0);
    this.conclusion = trim(conclusion);
    this.sub_index = []; //index of substition slots in conclusion
    this.link = {}; //link structure: {variable_name : {premise_tag: var_position_in premise,...},...}
  
    this.compile_and_link();
}

Rule.prototype.compile_and_link = function () {
        //compile regex for each premise (identified by a unique tag)
        //and link variable's name in each premise with corresponding matched position
        for (var i = 0, len = this.premises.length; i < len; i++) {
            this.premises[i] = compileAndLinkPattern(this.premises[i], this.link, i);
            this.premises[i].tag = i;
        }
        //find index for substitution slot in conclusion
        var a_conclusion = this.conclusion.split("");
        for (var i = 0, len = a_conclusion.length, test_pat = /[A-Za-uw-z]/; i < len; i++) {
            if (test_pat.test(a_conclusion[i])) {
                this.sub_index.push(i);
            }
        }
    };
    
 
Rule.prototype.substitute = function (var_map) {
        var a_conclusion = this.conclusion.split("");
        for (var i = 0, len = this.sub_index.length; i < len; i++) {
            var cur_pos = this.sub_index[i];
            if (var_map[a_conclusion[cur_pos]]) {
                a_conclusion[cur_pos] = var_map[a_conclusion[cur_pos]];
                if (/[v&]|(=>)(|-)/.test(a_conclusion[cur_pos])
                    && a_conclusion[cur_pos][0] != '(') {
                    a_conclusion[cur_pos] = "(" + a_conclusion[cur_pos] + ")";
                }
            } else {
                a_conclusion[this.sub_index[i]] = "<VAR>";
            }
        }
        return parse(a_conclusion.join("").split(""), 0);
    };
*/
function Expression(id, scope, content, type) {
    this.id = id;
    this.content = content;
    this.type = type;

    this.scope = scope;
    // if (this.type != "Assumption") {
    //     this.scope.pop();
    // }
};

function deduct(logicRule, expressionArray) {
    if (logicRule == "&i") {

    } else if (logicRule == "&e1") {

    } else if (logicRule == "&e2") {

    } else if (logicRule == "vi1") {

    } else if (logicRule == "vi2") {

    } else if (logicRule == "ve") {

    } else if (logicRule == "=>i") {

    } else if (logicRule == "=>e") {

    } else if (logicRule == "~~i") {

    } else if (logicRule == "~~e") {

    }
}