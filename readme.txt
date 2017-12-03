Для работы программы все файлы с данными должны находиться в папке со скриптом
Все данные вводятся латиницей

Для запуска необходимо запустить index.js:

# node index.js

Данные в входном файле должны быть в формате:
//номера столбцов в csv
id стейтмента (statement.id) = 1 столбец;
id пользователя (statement.actor.account.name) = 2 столбец;
verb (statement.verb.id) = 3 столбец;
timestamp (statement.timestamp) = 4 столбец;
success (statement.result.success) = 5 столбец;
object (statement.object.id) = 6 столбец;