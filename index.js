var csv = require('fast-csv');
var fs = require('fs');
var readline = require('readline');
var xml2js = require('xml2js');

//номера столбцов в csv
var actor = 1;
var verb = 2;
var timestamp = 3;
var success = 4;
var object = 5;

//переменные для ответов пользователя
var ans1;
var ans_s;
var ans2;
var name_course;

//данные использующиеся в разных функциях
var res = [];
var result = [];
var csv_in = [];
var xml_in = [];
var item_arr = [];
var items = [];
var users = {};
var length_session = 1800000;

var error_message1 = 'You wrote an incorrect answer. Programm ended';

//названия глаголов
var launched = 'http://adlnet.gov/expapi/verbs/launched';
var exited = 'http://adlnet.gov/expapi/verbs/exited';
var passed = 'http://adlnet.gov/expapi/verbs/passed';
var waived = 'https://w3id.org/xapi/adl/verbs/waived';
/*
var interacted = 'http://adlnet.gov/expapi/verbs/interacted';
var initialized = 'http://adlnet.gov/expapi/verbs/initialized';
*/

function add_zero_to_one(value) {
	if (value >=0 && value < 10) {
		var value = '0' + value;
		return value;
	} else {
		return value;
	};
};

//функция ParseData для перевода time stamp в читаемый вид
function ParseData(time) {
	var date = new Date(time);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    return add_zero_to_one(day) + "." + add_zero_to_one(month) + "." + add_zero_to_one(year) + " " + add_zero_to_one(hours) + ":" + add_zero_to_one(minutes) + ":" + add_zero_to_one(seconds);
}


//обработчик количества сессий, запускает выгрузку
function session_count(session) {
	//поиск значения в первой ячейке вложенных массивов
	function find(array, value) {
		for (var i = 0; i < array.length; i++) {
 			if (array[i][0] === value) return i;
 		};
	return -1;
	};
	for (var i = 0; i < session.length; i++) {
		if (find(res, session[i][0]['name']) == -1) {
			res.push([session[i][0]['name'], 1, session[i][1]])
		} else {
			for (var u = 0; u < (session.length); u++) {
				if (session[i][0]['name'] == session[u][0]['name']) {
					//console.log(find(res, session[i][0]));
					res[find(res, session[u][0]['name'])][1]++;
					res[find(res, session[u][0]['name'])][2] = res[find(res, session[u][0]['name'])][2] + session[u][1];
				};
			};
		};
	//console.log(res.length);
	};
	csv_to_out(ans2, res);
};

function attempion_count(attempts) {
	//console.log(attempts);
	function find(array, value) {
		for (var i = 0; i < array.length; i++) {
			if (array[i][0] != undefined) {
    			if (array[i][0] == value['name'] && array[i][1] == value['object']) {return i};
    		};
    	};
    	return -1;
	};
	for (var i = 0; i < (attempts.length); i++) {
		//console.log(attempts[i][0]['name'] + ' ' + attempts[i][0]['object']);
		if (find(res, attempts[i][0]) == -1) {
			res.push([attempts[i][0]['name'], attempts[i][0]['object'], 1, attempts[i][1]])
		} else {
		
		//console.log(attempts[u][0]['name'] + ' ' + attempts[u][0]['object'])
			for (var u = i + 1; u < attempts.length - 1; u++) {
				if (attempts[i][0]['name'] == attempts[u][0]['name'] && attempts[i][0]['object'] == attempts[u][0]['object']) {
					//console.log(find(res, attempts[i][0]));
					res[find(res, attempts[i][0])][2]++;
					res[find(res, attempts[i][0])][3] = res[find(res, attempts[i][0])][3] + attempts[i][1];
				};
			};
		};
	//console.log(res.length);
	};
	csv_to_out(ans2, res);
};

//обработчик попыток, получает массив, записывает попытки, запускает обработчик сессий
function worker_attempt(data_csv, control) {
	var i = 0;
	//ищем сессии одного пользователя не более 30 минут, привязанные в launched
	i = 0;
	function controller_exited(control) {
		if (control == 'session') {
			return (data_csv[a][verb] != exited);
		} else if (control == 'attempts') {
			return true;
		};
	};
	function controller_activity(data_a, data_i, control) {
		if (control == 'session') {
			return true;
		} else if (control == 'attempts') {
			return (data_a == data_i);
		};
	};
	function controller_launched(data, control) {
		if (control == 'session') {
			return data == launched;
		} else if (control == 'attempts') {
			return true;
		};
	};
	while (i < data_csv.length - 1) {
		//console.log('i' + i);
		if (controller_launched(data_csv[i][verb], control) && data_csv[i]['marked'] != true) {
			data_csv[i]['marked'] = true;
			var temp_session = [];
			temp_session.push({name: data_csv[i][actor], object: data_csv[i][object]});
			var a = i;
			do {
				a++;
				if  (data_csv[a][actor] == data_csv[i][actor] && controller_activity(data_csv[a][object], data_csv[i][object], control)) {
					data_csv[a]['marked'] = true;
					//console.log('i' + i + ' ' + 'a' + a);
					temp_session.push(data_csv[i][timestamp] - data_csv[a][timestamp]);
					var temp_a = data_csv[a][timestamp];
				};
			} while (a < (data_csv.length - 1) && ((data_csv[a - 1][timestamp] - data_csv[a][timestamp]) <= length_session) && controller_exited(control));
			var u = 1;
			var sum_session = 0;
			while (u < (temp_session.length)) {
				sum_session = sum_session + temp_session[u];
				u++;
			};
			//console.log(sum_session);
 			if (sum_session > 0) {
			result.push([temp_session[0], sum_session/1000]);
			};
		}; 
		i++;
	};
	if (control == 'session') {
		session_count(result);
	} else if (control == 'attempts') {
		attempion_count(result);
	};
	
};

//функция получает URL возвращает массив с statement, запускает обработчик попыток
function csv_to_in(url_in, callback, control) {
	var stream = fs.createReadStream(url_in);
	csv
	.fromStream(stream)
	.on("data", function(data){
		//console.log(data);
		csv_in.push(data);
	})
	.on("end", function(){
		console.log("done_load_csv");
		//переводим дату в числовой вид
		var i = 0;
		while (i < csv_in.length) {
			csv_in[i][timestamp] = Date.parse(csv_in[i][timestamp]);
			i++;
		};
		//сортируем массив по timestamp
		csv_in.sort(function (a, b) {
			if (a[timestamp] > b[timestamp]) {
			    return 1;
			} else if (a[timestamp] < b[timestamp]) {
    			return -1;
  			}else return 0;
			});
		callback(csv_in, control);
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

function dead_or_alive(arr, value) {
	for (key in arr) {
		if (value == arr[key]['time']) {
			console.log(arr[key]);
			return key;
		};
	};
	return 0;
};

function sort_the_arr(arr, key) {
	var min = arr[0][key];
	var max = min;
	var result_sort = [];
	for (var i = 1; i < arr.length; ++i) {
		if (arr[i][key] > max) {max = arr[i][key]};
		if (arr[i][key] < min) {min = arr[i][key]};
	};
	while (min < max) {
		var key_find;
		if (key_find = dead_or_alive(arr, min) != false) {result_sort.push(arr[key_find])};
		min++;
	};
	console.log(result);
	return result;
};

//сопоставляет passed к элементам структуры по каждому актеру
function users_success(structure_arr, users_obj) {
	function find(array, value) {
		for (var i = 0; i < array.length; i++) {
    		if (array[i]['obj'] === value) return i;
    	};
    	return -1;
	};
	//console.log(structure_arr);
	//console.log(users_obj);
	for (key in  users_obj) {
		var i = 0;
		var user_passed = [];
		while (i < structure_arr.length) {
			var a = 0;
			while (a < users_obj[key].length) {
				//console.log(name_course + structure_arr[i]);
				if (users_obj[key][a]['obj'] == name_course + structure_arr[i] && find(user_passed, users_obj[key][a]['obj']) == -1) {user_passed.push(users_obj[key][a])};
				a++;
			};
			i++;
			if (structure_arr.length == user_passed.length) {
				//var sort_users_by_time = sort_the_arr(users_obj[key], 'time');
				users_obj[key].sort(function (a, b) {
					if (a.name > b.name) {
					    return 1;
					}
					if (a.name < b.name) {
    					return -1;
  					};
  					// a должно быть равным b
  					return 0;
				})
				//console.log([key, user_passed[/*user_passed.length - 1*/0]['obj'], user_passed[/*user_passed.length - 1*/0]['time']])
				res.push([key, user_passed[user_passed.length - 1]['obj'], ParseData(user_passed[user_passed.length - 1]['time'])]);
			};
		};
	};
	//console.log(res);
	csv_to_out(ans2, res);
};

//получает масссив со стейтментами и в объект users передает свойства id_user : [{object_passed, timestamp_passed}, {object_passed, timestamp_passed}...]
function find_passed_to_element(arr_in) {
	//console.log(arr_in);
	//console.log(items);
	var i = 0;
	while (i < (arr_in.length)) {
		//arr_in[i][timestamp] = Date.parse(arr_in[i][timestamp]);
		if ((arr_in[i][verb] == passed && arr_in[i][success] == 1) || arr_in[i][verb] == waived) {
			//console.log(arr_in[i][actor]);
			if (arr_in[i][actor] in users) {
				users[arr_in[i][actor]].push({obj: arr_in[i][object], time: arr_in[i][timestamp]});
			} else {
				users[arr_in[i][actor]] = [{obj: arr_in[i][object], time: arr_in[i][timestamp]}];
			};
		};
		i++;
	};
	//console.log(items);
	//console.log(users);
	users_success(items, users);
};

//рекурсивно проверяет наличие указанного элемента в указанном объекте и возвращает его в массив items
function find_element_in_object(arr) {
	for (key in arr) {
		var exit = false;
		//console.log(key + ' = ' + arr[key]);
		if (key == 'course') {
			name_course = arr[key][0]['$']['id'];
			//console.log('COURSE:' + name_course);
		};
		if (key == 'item') {
			for (var i = 0; i < arr[key].length; i++) {
				var weight = 1;
				try {
					//console.log(arr[key][i]['config'][0]['variable'][0]['$']['name']);
					if (arr[key][i]['config'][0]['variable'][0]['$']['name'] == 'weight') {weight = arr[key][i]['config'][0]['variable'][0]['_']};
				} catch (err) {
					//console.log(err);
				};
				if (arr[key][i]['$']['id'] != undefined && weight != 0) {items.push(arr[key][i]['$']['id'])};
				if (weight == 0) {exit = true};
			};
		};
		if (typeof(arr[key]) == 'object' && exit == false) {
			//console.log('down');	
			find_element_in_object(arr[key]);
		};
	};
};

//разбираем xml-файл структуры на список активити 
function xml_to_in(url_in) {
	var parser = new xml2js.Parser();
	fs.readFile(url_in, function(err, data) {
    	parser.parseString(data, function (err, result_xml) {
        	//console.log(xml_in.manifest.courses[0].course[0].content[0].item);
        	var path = result_xml/*.manifest.courses[0].course[0].content*/;
        	//console.log(path[0].item[0].item[0].item[0].item[2])
        	find_element_in_object(path);
        	csv_to_in(ans1, find_passed_to_element);
        	//console.log(items);
    	});
	});
};

//запускаем диалог
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question('Do you want to count (S)session, (C)ompletion or (A)ttempts? (s/c/a)', (answer_work) => {
	
	if (answer_work === 'A' || answer_work === 'a') {
		//рассчитываем количество и время попыток пользователей
		rl.question('Where I can find file whis statements on one activity  (.csv)? ', (answer1) => {
			rl.question('Where I can put results (.csv)? ', (answer2) => {
        		console.log('Your statements in: ' + answer1);
	        	console.log('Result will put to: ' + answer2)
	        	var ans1 = answer1;
	        	ans2 = answer2;
	        	//запускаем обраотку
	        	csv_to_in(ans1, worker_attempt, 'attempts');
	        	rl.close();
	        });
		});
	} else if (answer_work === 'S' || answer_work === 's') {
		//рассчитываем количество и время попыток пользователей
		rl.question('Where I can find file whis statements (.csv)? ', (answer1) => {
			rl.question('Where I can put results (.csv)? ', (answer2) => {
        		console.log('Your statements in: ' + answer1);
	        	console.log('Result will put to: ' + answer2)
	        	var ans1 = answer1;
	        	ans2 = answer2;
	        	//запускаем обраотку
	        	csv_to_in(ans1, worker_attempt, 'session');
	        	rl.close();
	        });
		});
	} else if (answer_work === 'C' || answer_work === 'c') {
		//определяет количество завершивших курс
		rl.question('Where I can find file whis statements (.csv)? ', (answer1) => {
			rl.question('Where I can find file whis structure (.xml)? ', (answer_str) => {
				rl.question('Where I can put results (.csv)? ', (answer2) => {
					//rl.question('How named you course? (exm: https://crmm.ru/xapi/courses/sbfba) ', (answer_name) => {
	       		 		console.log('Result will put to: ' + answer2);
	       		 		//name_course = answer_name;
	        			ans1 = answer1;
	        			ans_s = answer_str;
	        			ans2 = answer2;
	        			console.log('Your statements in: ' + answer1);
	        			//запускаем обработку
	        			xml_to_in(ans_s);
	        			rl.close();
	        		//});
				});		
			});
		});
	} else {
		console.log(error_message1);
		rl.close();
	};
});
