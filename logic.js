
var builtin_rules = { //Fundamental Logical Rules
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
