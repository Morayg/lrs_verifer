var csv = require('fast-csv');
var fs = require('fs');
var readline = require('readline');
var xml2js = require('xml2js');

var items = [];
var items_2 = [];

function compare_two_array_and_print_diff (arr1, arr2) {
		//console.log(items_2);
		var count_diff = 0;
		if (arr1.length < arr2.length) {
			var arr = arr1;
			arr1 = arr2;
			arr2 = arr1;
			arr = 0;
		};
		for(var i = 0; i < arr1.length; i++) {
				var compare = 0;
		    for(var j = 0; j < arr2.length; j++) {
		        if(arr1[i] == arr2[j]) {
							compare++;
						};
				};
				if (compare == 0) {
					console.log('Не совпавший элемент: ' + arr1[i]);
					count_diff++;
				} else {
					console.log('Cовпавший элемент: ' + arr1[i])
				};
		};
		if (count_diff == 0) {
			console.log('Полное совпадение');
		};
};

//рекурсивно проверяет наличие указанного элемента в указанном объекте и возвращает его в массив items
function find_element_in_object(arr, arr_result) {
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
				if (arr[key][i]['$']['id'] != undefined && weight != 0) {arr_result.push(arr[key][i]['$']['id'])};
				if (weight == 0) {exit = true};
			};
		};
		if (typeof(arr[key]) == 'object' && exit == false) {
			//console.log('down');
			find_element_in_object(arr[key], arr_result);
		};
	};
};

//разбираем xml-файл структуры на список активити
function xml_to_in(url_in, next_structure) {
	var parser = new xml2js.Parser();
	fs.readFile(url_in, function(err, data) {
    	parser.parseString(data, function (err, result_xml) {
        	var path = result_xml;
        	//console.log(items);
					if (next_structure != undefined) {
						xml_to_in(next_structure);
						find_element_in_object(path, items);
					} else if (next_structure == undefined) {
						//console.log(items);
						find_element_in_object(path, items_2);
						setTimeout(compare_two_array_and_print_diff, 1000, items, items_2);
					};
    	});
	});
};

//запускаем диалог
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question('Please, give me name file first structure: ', (first_structure) => {
	rl.question('Please, give me name file second structure: ', (second_structure) => {
		xml_to_in(first_structure, second_structure);
		rl.close();
	});
});
