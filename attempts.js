//поиск значения в первой ячейке вложенных массивах
function find(array, value) {
	for (var i = 0; i < array.length; i++) {
    	if (array[i][0] === value) return i;
    };
    return -1;
};

//обработчик количества сессий, запускает выгрузку
function session_count(session) {
	var i = 0;
	while (i < (session.length - 1)) {
		if (find(res, session[i][0]) == -1) {
			res.push([session[i][0], 1, session[i][1]])
		} else {
		var u = 0;
			while (u < (session.length - 1)) {
				if (session[i][0] == session[u][0]) {
					//console.log(find(res, session[i][0]));
					res[find(res, session[u][0])][1]++;
					res[find(res, session[u][0])][2] = res[find(res, session[u][0])][2] + session[u][1];
				};
			u++;
			};
		};
	i++;
	//console.log(res.length);
	};
	csv_to_out(ans2, res);
};

//обработчик попыток, получает массив, записывает попытки, запускает обработчик сессий
function worker_attempt(data_csv) {
	var i = 0;
	//переводим дату в числовой вид
	while (i < (data_csv.length - 1)) {
		data_csv[i][timestamp] = Date.parse(data_csv[i][timestamp]);
		i++;
	}
	//ищем сессии одного пользователя не более 30 минут, привязанные в launched
	i = data_csv.length - 1;
	while (i >= 0) {
		//console.log('i' + i);
		if (data_csv[i][verb] == launched) {
			var temp_session = [];
			temp_session.push(data_csv[i][actor]);
			var a = i;
			do {
				a--;
				//console.log('i' + i + ' ' + 'a' + a);
				if (data_csv[a][actor] == data_csv[i][actor]) {
					temp_session.push(data_csv[a][timestamp] - data_csv[i][timestamp]);
					var temp_a = data_csv[a][timestamp];
				};
			} while (a > 0 && ((data_csv[a - 1][timestamp] - data_csv[a][timestamp]) <= length_session && data_csv[a][verb] != exited));
				var u = 1;
				var sum_session = 0;
				while (u <= (temp_session.length - 1)) {
					sum_session = sum_session + temp_session[u];
					u++;
				};
 			if (sum_session > 0) {
			result.push([temp_session[0], sum_session/1000]);
			};
		}; 
		i--;
	};
	session_count(result);
};

//функция получает URL возвращает массив с statement, запускает обработчик попыток
function csv_to_in(url_in) {
	var stream = fs.createReadStream(url_in);
	csv
	.fromStream(stream)
	.on("data", function(data){
		//console.log(data);
		csv_in.push(data);
	})
	.on("end", function(){
		console.log("done_load_csv");
		worker_attempt(csv_in);
	});

};

//получает массив  - записывает в URL
function csv_to_out(url_out, output_stream) {
	var ws = fs.createWriteStream(url_out);
	csv
	.write(output_stream, {headers: true})
	.pipe(ws);
	console.log('done, data exported to: ' + ans2);
};
