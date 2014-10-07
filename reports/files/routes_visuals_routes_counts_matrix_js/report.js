__report = {"info":{"file":"routes/visuals/routes_counts_matrix.js","fileShort":"routes/visuals/routes_counts_matrix.js","fileSafe":"routes_visuals_routes_counts_matrix_js","link":"files/routes_visuals_routes_counts_matrix_js/index.html"},"complexity":{"aggregate":{"line":2,"complexity":{"sloc":{"physical":570,"logical":332},"cyclomatic":48,"halstead":{"operators":{"distinct":22,"total":794,"identifiers":["__stripped__"]},"operands":{"distinct":161,"total":907,"identifiers":["__stripped__"]},"length":1701,"vocabulary":183,"difficulty":61.96894409937888,"volume":12784.205424921158,"effort":792223.7113319155,"bugs":4.261401808307053,"time":44012.42840732864},"params":23}},"functions":[{"name":"get_biome_matrix","line":42,"complexity":{"sloc":{"physical":98,"logical":58},"cyclomatic":6,"halstead":{"operators":{"distinct":20,"total":142,"identifiers":["__stripped__"]},"operands":{"distinct":64,"total":169,"identifiers":["__stripped__"]},"length":311,"vocabulary":84,"difficulty":26.40625,"volume":1988.0107184841943,"effort":52495.908034973254,"bugs":0.6626702394947315,"time":2916.439335276292},"params":3}},{"name":"onlyUnique","line":135,"complexity":{"sloc":{"physical":3,"logical":1},"cyclomatic":1,"halstead":{"operators":{"distinct":4,"total":4,"identifiers":["__stripped__"]},"operands":{"distinct":4,"total":7,"identifiers":["__stripped__"]},"length":11,"vocabulary":8,"difficulty":3.5,"volume":33,"effort":115.5,"bugs":0.011,"time":6.416666666666667},"params":3}},{"name":"fill_in_counts_matrix","line":144,"complexity":{"sloc":{"physical":84,"logical":35},"cyclomatic":5,"halstead":{"operators":{"distinct":15,"total":83,"identifiers":["__stripped__"]},"operands":{"distinct":22,"total":89,"identifiers":["__stripped__"]},"length":172,"vocabulary":37,"difficulty":30.340909090909093,"volume":896.0259788881795,"effort":27186.242768539083,"bugs":0.2986753262960598,"time":1510.3468204743936},"params":2}},{"name":"create_biome_matrix","line":235,"complexity":{"sloc":{"physical":37,"logical":25},"cyclomatic":2,"halstead":{"operators":{"distinct":12,"total":82,"identifiers":["__stripped__"]},"operands":{"distinct":24,"total":101,"identifiers":["__stripped__"]},"length":183,"vocabulary":36,"difficulty":25.25,"volume":946.0962752639431,"effort":23888.930950414564,"bugs":0.31536542508798104,"time":1327.1628305785869},"params":4}},{"name":"create_unit_name_lookup","line":292,"complexity":{"sloc":{"physical":15,"logical":10},"cyclomatic":2,"halstead":{"operators":{"distinct":11,"total":19,"identifiers":["__stripped__"]},"operands":{"distinct":7,"total":24,"identifiers":["__stripped__"]},"length":43,"vocabulary":18,"difficulty":18.857142857142858,"volume":179.30677506201943,"effort":3381.213472598081,"bugs":0.059768925020673144,"time":187.84519292211561},"params":4}},{"name":"create_text_matrix","line":338,"complexity":{"sloc":{"physical":25,"logical":17},"cyclomatic":1,"halstead":{"operators":{"distinct":8,"total":39,"identifiers":["__stripped__"]},"operands":{"distinct":19,"total":50,"identifiers":["__stripped__"]},"length":89,"vocabulary":27,"difficulty":10.526315789473685,"volume":423.18498769254876,"effort":4454.578817816303,"bugs":0.14106166256418293,"time":247.4766009897946},"params":4}},{"name":"assemble_taxa","line":366,"complexity":{"sloc":{"physical":206,"logical":176},"cyclomatic":37,"halstead":{"operators":{"distinct":9,"total":405,"identifiers":["__stripped__"]},"operands":{"distinct":53,"total":447,"identifiers":["__stripped__"]},"length":852,"vocabulary":62,"difficulty":37.95283018867925,"volume":5072.975256449618,"effort":192533.76845940395,"bugs":1.6909917521498727,"time":10696.320469966886},"params":3}}],"maintainability":42.09574605405747,"params":3.2857142857142856,"module":"routes/visuals/routes_counts_matrix.js"},"jshint":{"messages":[{"severity":"error","line":105,"column":32,"message":"'uname' used out of scope.","source":"'{a}' used out of scope."},{"severity":"error","line":108,"column":15,"message":"'did' used out of scope.","source":"'{a}' used out of scope."},{"severity":"error","line":111,"column":22,"message":"'did' used out of scope.","source":"'{a}' used out of scope."},{"severity":"error","line":111,"column":61,"message":"'uname' used out of scope.","source":"'{a}' used out of scope."},{"severity":"error","line":111,"column":99,"message":"'did' used out of scope.","source":"'{a}' used out of scope."},{"severity":"error","line":112,"column":23,"message":"'cnt' used out of scope.","source":"'{a}' used out of scope."},{"severity":"error","line":112,"column":58,"message":"'did' used out of scope.","source":"'{a}' used out of scope."},{"severity":"error","line":112,"column":63,"message":"'uname' used out of scope.","source":"'{a}' used out of scope."},{"severity":"error","line":113,"column":40,"message":"'uname' used out of scope.","source":"'{a}' used out of scope."},{"severity":"error","line":113,"column":52,"message":"'cnt' used out of scope.","source":"'{a}' used out of scope."},{"severity":"error","line":116,"column":40,"message":"'uname' used out of scope.","source":"'{a}' used out of scope."},{"severity":"error","line":120,"column":22,"message":"'uname' used out of scope.","source":"'{a}' used out of scope."},{"severity":"error","line":244,"column":9,"message":"Creating global 'for' variable. Should be 'for (var uk ...'.","source":"Creating global 'for' variable. Should be 'for (var {a} ...'."},{"severity":"error","line":257,"column":11,"message":"Creating global 'for' variable. Should be 'for (var d ...'.","source":"Creating global 'for' variable. Should be 'for (var {a} ...'."},{"severity":"error","line":300,"column":16,"message":"'c' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":370,"column":34,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":378,"column":38,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":385,"column":26,"message":"'p_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":388,"column":38,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":393,"column":37,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":400,"column":26,"message":"'p_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":401,"column":26,"message":"'k_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":405,"column":38,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":410,"column":37,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":415,"column":37,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":422,"column":26,"message":"'p_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":423,"column":26,"message":"'k_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":424,"column":26,"message":"'o_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":428,"column":38,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":433,"column":37,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":438,"column":37,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":443,"column":38,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":450,"column":26,"message":"'p_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":451,"column":26,"message":"'k_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":452,"column":26,"message":"'o_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":453,"column":26,"message":"'f_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":457,"column":38,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":462,"column":37,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":467,"column":37,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":472,"column":38,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":477,"column":37,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":484,"column":26,"message":"'p_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":485,"column":26,"message":"'k_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":486,"column":26,"message":"'o_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":487,"column":26,"message":"'f_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":488,"column":26,"message":"'g_id' is already defined.","source":"'{a}' is already defined."},{"severity":"error","line":491,"column":38,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":496,"column":37,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":501,"column":37,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":506,"column":38,"message":"['taxon'] is better written in dot notation.","source":"['{a}'] is better written in dot notation."},{"severity":"error","line":506,"column":38,"message":"Too many errors. (85% scanned).","source":"Too many errors."}]}}