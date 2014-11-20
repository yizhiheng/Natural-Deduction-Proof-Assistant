function trim(string) {
	//匹配了制表符,空行等,并替换成空
	return string.replace(/[\s\n\t]+/g, "");
};

function beautify(string) {
		//美化输入内容
		var t_string = string.replace(/([v&]|=>)(.)/g, "\$1 \$2");
		t_string = t_string.replace(/(.)([v&]|=>)/g, "\$1 \$2");
		return t_string;
	}
	//定义几种优先级
var precedence = {
	"none": 4,
	">": 2,
	"=": 2,
	"&": 2,
	"v": 2,
	"~": 3
};

//比较优先级,如果参数1比参数2小,返回-1.......
function comparePrecedence(operator1, operator2) {
	var pre1 = precedence[operator1],
		pre2 = precedence[operator2];
	if (pre1 < pre2) {
		return -1;
	} else if (pre1 == pre2) {
		return 0;
	} else {
		return 1;
	}
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
			var leftmost = depth && /[&v~]|(=)|(>)|(-)/.exec(s[depth - 1]);
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
		} else if (c == ')') { //判断如果内容中含有右括号
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