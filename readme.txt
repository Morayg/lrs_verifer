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

(S)session кол-во сессий(можно загрузить данные по одной сущности)
(C)ompletion кол-во завершивших(можно считать за период, но должны быть все сущности)
(A)ttempts кол-во попыток(должны быть загружены все данные)

Session

1. Необходимо загрузить отчет из lrs в папку со скриптом http://joxi.ru/xAeB4MviYy3ejr

2. Открываем консоль, переходим в папку со скриптом. Нужно указать путь к папке со скриптом.
C:\Users\user>cd \Users\user\Desktop\lrs_verifer-master

3. Открываем скрипт через консоль командой, которая указана ниже
C:\Users\user\Desktop\lrs_verifer-master>node index.js

4. Затем скрипт спрашивает что мы хотим посчитать: Сессии, Попытки или Завершения?
Do you want to count (S)session, (C)ompletion or (A)ttempts? (s/c/a)

5. Выбираем s.
Do you want to count (S)session, (C)ompletion or (A)ttempts? (s/c/a)s

6. Здесь необходимо написать имя отчета из lrs с расширением.
Where I can find file whis statements (.csv)? mik.csv

7. Скрипт спрашивает куда положить результат. Здесь необходимо придумать имя файла для сохранения результата, например out_mik.csv (с расширением).
Where I can put results (.csv)? out_mik.csv

Если все пройдет успешно, то появится следующее сообщение
Your statements in: mik.csv
Result will put to: out_mik.csv
done_load_csv
____________

Completion

5. Выбираем c
Do you want to count (S)session, (C)ompletion or (A)ttempts? (s/c/a)c

6. Здесь необходимо написать имя отчета из lrs с расширением.
Where I can find file whis statements (.csv)? mik.csv

7. Далее необходимо ввести имя файла со структурой. Найти его можно тут https://local.crmm.ru/course/course_structures/list.php .
Where I can find file whis structure (.xml)? mik.xml

8. Скрипт спрашивает куда положить результат. Здесь необходимо придумать имя файла для сохранения результата, например out_mik.csv (с расширением).
Where I can put results (.csv)? out_c_mik.csv
_________

Attempts

5. Выбираем a.
Do you want to count (S)session, (C)ompletion or (A)ttempts? (s/c/a) a

6. Здесь необходимо написать имя отчета из lrs с расширением.
Where I can find file whis statements (.csv)? mik.csv

7. Скрипт спрашивает куда положить результат. Здесь необходимо придумать имя файла для сохранения результата, например out_mik.csv (с расширением).
Where I can put results (.csv)? out_a_mik.csv
