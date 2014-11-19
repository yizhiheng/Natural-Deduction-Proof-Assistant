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