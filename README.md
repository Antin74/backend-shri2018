# Приложение для создания и редактирования информации о встречах сотрудников

Написано для Node.js 8 и использует библиотеки:
* express
* sequelize
* graphql

## Задание
Код содержит ошибки разной степени критичности. Некоторых из них стилистические, а некоторые даже не позволят вам запустить приложение. Вам необходимо найти и исправить их.

Пункты для самопроверки:
1. Приложение должно успешно запускаться
2. Должно открываться GraphQL IDE - http://localhost:3000/graphql/
3. Все запросы на получение или изменения данных через graphql должны работать корректно. Все возможные запросы можно посмотреть в вкладке Docs в GraphQL IDE или в схеме (typeDefs.js)
4. Не должно быть лишнего кода
5. Все должно быть в едином codestyle

## Запуск
```
npm i
npm run dev
```

Для сброса данных в базе:
```
npm run reset-db
```

## Перед прочтением "Процесса решения" 

В процессе решения старалась подробно описать основные действия, 
как мыслила и как пришла к тому или иному выводу + могут встречаться некоторые отступления и догадки. 


### Процесс решение

> Прим. Перед началом работы:  Документация и скринкасты по nodejs - чтобы осознать саму структуру работы. 

***
- Удалила "test" в package.json - так как он не имел большого смысла
***
**\index.js :** 
- Пропущена ";" в конце
```js
app.use('/', pagesRoutes)
```

- Вместо '/graphql' - указано '/graphgl'
```js
app.use('/graphgl', graphqlRoutes); 
```

- Не верно передана функция для отображения
```
app.listen(3000, () => console.log('Express app listening on localhost:3000')); 
```

***
**\models\index.js** 

- При запуске приложения выдавалась ошибка, полезла по адресу этой ошибки и смотрела -
почему в Sequelize не был определ dialect, хотя он передавался.
```js
const sequelize = new Sequelize(null, null, {
```

есть конструктор, и там объект с опциями - передавался последним.
Не хватает параметра "password" для передачи в конструктор
поэтому выходила ошибка что в options не было определено свойство - dialect.
**\node_modules\sequilize\lib\sequelize.js**
```
 constructor(database, username, password, options)
```
***

#### Сервер запустили, проверяем синтаксис #####

Для этого запускаем модуль semistandard, он проверяет ошибки и синтаксис js.

```
npm run lint
```

- Лишняя запятая 
**graphql\routes.js**
```js
router.use(graphqlHTTP({
  schema: schema,
  graphiql: true, 
}));
```

- Приводим структуру в порядок с отступами

**models\index.js** 
**graphql\resolvers\query.js** 

- Неизвестный параметр argumets, меняем на arguments
```
graphql\resolvers\query.js
return models.Event.findAll(argumets, context);
```

#### Попробуем провести рефакторинг

В файле **graphql\routes.js**
```
const resolvers = require('./resolvers');
```
В переменную resolvers - возвращается функция resolvers( а сама функция resolvers() - возвращает объект, 
и ничего больше в ф-ии не происходит). И потом 
`resolvers : resolvers() `
Переменная resolvers(которая по сути содержит только именнованную ф-ию) вызывает эту же функцию resolvers()
Поскольку ф-ия resolvers() становится доступной так как является именнованной функцией в переменной resolvers
И в итоге передает объект из модуля. 
Думаю тут нужно убрать эту "непонятку". 

Поэтому в модуле **/graphql/resolvers/index.js** - удалим возвращаюмую функцию в exports resolvers() 
и оставим только возвращение объекта. 

Для организации кода перенесем все маршруты из **/index.js**
в специальный файл **/pages/routes.js**

>Прим. Для graphql генерацию схемы - я бы тоже вынесла в отдельный файл, а не хранила рядом с определением маршрутов для graphql - но это позже. 
Думаю будет полезно при написании тестов, чтобы обращаться не через веб интерфейс, а напрямую в grapql.

Из файла по graphql readme.md для пользования graphql в дальнейших в тестах планирую использовать функцию
graphql из модуля. 
```js
graphql(schema, query).then(result => {
   // Prints
   // {
   //   data: { hello: "world" }
   // }
   console.log(result);
});
``` 

#### Проверка работы graphql

По документации graphql стало понятно, как составлять запросы, и более менее - как организовывать схему. 
Но с распознавателями надо разбираться. 

Попробую на "текущих знаниях" определить ошибки. 

Откроем http://localhost:3000/graphql/ и посмотрим, какие операции и типы доступны для работы. 
из файла **/graphql/routes.js** определяем, что операции и типы задаются в файлах **/graphql/resolvers/index.js**, 
а оттуда в **mutation.js** и **query.js** 

Из раздела docs, запущенного graphql -  http://localhost:3000/graphql/ - видим, что в **mutations.js** не описана операция 
```
addUserToEvent(id: ID!, userId: ID!): Event 
```

В файле **/graphql/resolvers/query.js** не указан тип, который обозначен в **/graphql/typeDefs.js**
```js
type UserRoom {
    id: ID!
    title: String!
}
```
Смыслового значения не вижу, пока удалила. Понимаю, что для User - задают homeFloor - как их этаж. 
А названия комнат на этажах - задают в Room c указанием этажа.   

>Прим. Пока недостаточно изучила документацию по graphql, чтобы поправить.
Стараюсь отвлечься пока вёрстку и разработку фронтэнда. 

##### Связь с frontend

Для работы с фронтэндом - отключаем графический вывод graphiql в файле **/graphql/routes.js** 

```js
router.use(graphqlHTTP({
  schema: schema,
  graphiql: false
}));
```

Frontend для приложения разместила на порте 80. Поэтому при запросе к 
возникла ошибка CORS «Access-Control-Allow-Origin». 
То есть js - не может читать кросдомено запросы. A backend и frontend 
приложения висят на разных портах. 

Введем контроллер - `allowCORS` - только для graphql и 
с помощью специальных заголовков разрешим кросдоменные запросы. 
П.с. Тестировала - на других адресах - не открывается. Однако игнорирует параметр 
Access-Control-Allow-Methods. Нужно будет вернуться к этому вопросу. 

#### Тестирование
 Пока модульные тесты не написаны, попалась довольно интересная статья. 
 https://habrahabr.ru/post/308352/
 Собиралась опираться на неё. 
