

/* Convert a proposition to regex for pattern matching
 * The pattern is identified by a <tag>
 * link the variables position in the compiled pattern to a
 * variable name in the <link> dictionary
 */
function compileAndLinkPattern(pattern_string, link, tag) {
    var trimmed_pattern = trim(pattern_string);
    var divided_pattern = trimmed_pattern.split("");
    var is_compound = /[&v=>]/.test(trimmed_pattern);
    
    var matched_variable_count = 0;
    var variable_ids = {};
    for (var i = 0, len = divided_pattern.length, test_pat = /[A-Za-uw-z]/; i < len; i++) {
        if (test_pat.test(divided_pattern[i])) {
            if (variable_ids[divided_pattern[i]]) {
                divided_pattern[i] = "\\" +  variable_ids[divided_pattern[i]];
            } else {
                variable_ids[divided_pattern[i]] = ++matched_variable_count;
                
                link[divided_pattern[i]] = link[divided_pattern[i]] || {};
                link[divided_pattern[i]][tag] = matched_variable_count;
                
                if (!is_compound) {
                    divided_pattern[i] = "([\\w\\(\\)v&~=>\|-]+)";
                } else {
                    divided_pattern[i] = "([~\\w]+|~*\\([\\w\\(\\)v&~=>\|-]+\\))";
                }
            }
        } else if (divided_pattern[i] === '(' || divided_pattern[i] === ')' ||
                   divided_pattern[i] === '|'){
            divided_pattern[i] = '\\' + divided_pattern[i];
        }

    }
    return new RegExp("^" + divided_pattern.join("") + "$");
}

//解析
function parse(s, depth) {
    var out = '';
    var lowest = "none";

    while (depth < s.length) {
        var c = s[depth];
        
        //判断如果如果内容中含有左括号
        if (c == '(') {
            var p = parse(s, depth + 1);
            var leftmost = depth && /[&v~]|(=)|(>)|(-)/.exec(s[depth-1]);
            var rightmost = p[1] && (depth + p[1].length + 2) < (s.length - 1) &&
                            /[&v~]|(=)|(>)|(-)/.exec(s[depth + p[1].length + 2]);
            
            if (p[1].length > 1 && p[0] != "~" &&
                ((leftmost && comparePrecedence(p[0], leftmost[0]) <= 0) ||
                 (rightmost && comparePrecedence(p[0], rightmost[0]) <= 0))) {
                
                depth += p[1].length + 2;
                p[1] = '(' + p[1] + ')';
                
            } else {
                depth += p[1].length + 2;
            }
            
            out += p[1];
        } else if (c == ')') {  //判断如果内容中含有右括号
            if (out.length > 0) {
                return [lowest, out];
            } else {
                depth++;
            }
        } else {
            if (precedence[c] && comparePrecedence(c, lowest) < 0) {
                lowest = c;
            }
            out += c;
            depth++;
        }
    }
    return out;
}

/* Rule function constructor
 * params: name: String; premises: String Array; conclusion: String
 */
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

/* Generate a variable_name -> variable value map
 * from a dictionary of tagged matches' variable values
 * using a rule's link dictionary
 */
function generateVarMap(taggedMatches, rule) {
    var var_map = {};
    for (var var_name in rule.link) {
        var premises_set = rule.link[var_name];
        var variable_value = "";
        for (var tag in premises_set) {
            var value_pos = premises_set[tag];
            if (variable_value == "") {
                variable_value = taggedMatches[tag][value_pos];
            } else if (taggedMatches[tag][value_pos] != variable_value) {
                return null;
            }
        }
        var_map[var_name] = variable_value;
    }
    return var_map;
}


/* Match an array of expressions with a Rule object's premises
 * return a variables map for conclusion substituion or null if cannot match
 */
function matchWithRule(expressions, rule) {
    if (expressions.length < rule.premises.length) {
        return null;
    }
    
    var matched = arrayInit(false, expressions.length)
    var taggedMatches = {}; //{premise_tag: [match, matched_variables]}
    
    for (var i = 0; i < expressions.length; i++) {
        var expr = trim(expressions[i]);
        var j = 0;
        for (;j < rule.premises.length; j++) {
            if (!matched[j]) {
                var match = rule.premises[j].exec(expr);
                if (match) {
                    for (var k = 1; k < match.length; k++) {
                        match[k] = parse(match[k].split(""), 0);
                    }
                    taggedMatches[rule.premises[j].tag] = match;
                    matched[j] = true;
                    break;
                }   
            }
        }
        if (j >= rule.premises.length) {
            return null;
        }
    }
    return generateVarMap(taggedMatches, rule);
}

/* Expression object constructor
 * params: identifier: string;
 */
function Expression(identifier, content, type, rule_name) {
    this.identifier = identifier;
    this.content = content;
    this.rule_name = rule_name;
    this.type = type;
    
    this.scope = identifier.split(".");
    if (this.type != "Assumption") {
        this.scope.pop();
    }
}

//check if an expression can be seen under a scope
//params: scope: number array
Expression.prototype.canBeSeen = function (scope) {
    if (this.scope.length > scope.length) {
        return false;
    } else {
        for (var i = 0, len = this.scope.length; i < len; i++) {
            if (this.scope[i] != scope[i]) {
                return false;
            }
        }
    }
    return true;
};
//-------------------------------------------------------------------------------------------------
//Construct rules: Use only single alphabetical character to represent variables to be substituted
//"<unique identifier": new Rule("<rule name>", [<premise1>,...], "<conclusion>")
var builtin_rules = { //Fundamental Logical Rules
/*   "&I": new Rule("Conjunction Intro", ["A", "B"], "A & B"),
    "&E1": new Rule("Conjunction Elim 1", ["A & B"], "A"),
    "&E2": new Rule("Conjunction Elim 2", ["A & B"], "B"),
    "vI1": new Rule("Disjunction Intro 1", ["A"], "A v B"),
    "vI2": new Rule("Disjunction Intro 2", ["A"], "B v A"),
    "vE": new Rule("Disjunction Elim", ["A v B", "A => C", "B => C"], "C"),
    "~~E": new Rule("Double Negation Ellim", ["~~A"], "A"),
    "~I": new Rule("Negation Intro", ["A => (B & ~B)"], "~A"),
    "=>I": new Rule("Discharge Rule", ["A |- B"], "A => B"),
    //Extra Logical Rules
    "~~I": new Rule("Double Negation Intro", ["A"], "~~A"),
    "MP": new Rule("=>E", ["A", "A => B"], "B"),
    "MT": new Rule("Modus Tollens", ["A => B", "~B"], "~A"),
    "DS": new Rule("Disjunctive Syllogism", ["A v B", "~A"], "B"),
    "Iter": new Rule("Iteration", ["A"], "A")*/
    "&I": new Rule("&I", ["A", "B"], "A & B"),
    "&I1": new Rule("&I1", ["A & B"], "A"),
    "&I2": new Rule("&I2", ["A & B"], "B"),
    "vI1": new Rule("vI1", ["A"], "A v B"),
    "vI2": new Rule("vI2", ["A"], "B v A"),
    "vE": new Rule("vE", ["A v B", "A => C", "B => C"], "C"),
    "=>I": new Rule("=>I", ["A |- B"], "A => B"),
    "=>E": new Rule("=>E", ["A", "A => B"], "B"),
    "~I": new Rule("~I", ["~A => (B & ~B)"], "~~A"),
    "~~I": new Rule("~~I", ["A"], "~~A"),
    "~~E": new Rule("~~E", ["~~A"], "A"),
};

//Constants
var EXPR_STRING_CLASS_NAME = "expression_string";
var EXPR_MODIFIER_CLASS_NAME = "expression_modifier";
var EXPR_ITEM_CLASS_NAME = "expression_content";
var EXPR_ITEM_SELECTED_CLASS_NAME = "expression_content_selected";
var EXPR_PREFIX = "expr_";
var SCOPE_PREFIX = "scope_";

var INVALID_SCOPE = 1;
var INVALID_MATCH_QUANTITY = 2;
var INVALID_MATCH_QUALITY = 3;
var ERROR_MESSAGE_SCOPE = "Some premises cannot be used under current scope";
var ERROR_MESSAGE_MATCH_QUANTITY = "Invalid number of premises";
var ERROR_MESSAGE_MATCH_QUALITY = "Premises cannot match selected rule pattern";
var ERROR_RULE_ALREADY_EXISTS = "Rule identifier already exists";

