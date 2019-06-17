# fms-api-client

[![Build Status](https://travis-ci.com/Luidog/fms-api-client.png?branch=master)](https://travis-ci.com/Luidog/fms-api-client) [![Known Vulnerabilities](https://snyk.io/test/github/Luidog/fms-api-client/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Luidog/fms-api-client?targetFile=package.json) [![Coverage Status](https://coveralls.io/repos/github/Luidog/fms-api-client/badge.svg?branch=master)](https://coveralls.io/github/Luidog/fms-api-client?branch=master) [![GitHub issues](https://img.shields.io/github/issues/Luidog/fms-api-client.svg?style=plastic)](https://github.com/Luidog/fms-api-client/issues) [![Github commits (since latest release)](https://img.shields.io/github/commits-since/luidog/fms-api-client/latest.svg)](https://img.shields.io/github/issues/Luidog/fms-api-client.svg) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![GitHub license](https://img.shields.io/github/license/Luidog/fms-api-client.svg)](https://github.com/Luidog/fms-api-client/blob/master/LICENSE.md)

A FileMaker Data API client designed to allow easier interaction with a FileMaker database from a web environment. This client abstracts the FileMaker 17 & 18 Data API into class based methods.

[fms-api-client documentation](https://luidog.github.io/fms-api-client/)

## Table of Contents

- [License](#license)
- [Installation](#installation)
- [Usage](#usage)
  - [Introduction](#introduction)
  - [Parameter Syntax](#parameter-syntax)
    - [Script Array Syntax](#script-array-syntax)
    - [Portals Array Syntax](#portals-array-syntax)
    - [Data Syntax](#data-syntax)
    - [Sort Syntax](#sort-syntax)
    - [Query Syntax](#query-syntax)
  - [Datastore Connection](#datastore-connection)
  - [Client Creation](#client-creation)
  - [Client Use](#client-use)
  - [Request Queue](#request-queue)
  - [Data API Sessions](#data-api-sessions)
    - [Login Method](#login-method)
    - [Logout Method](#logout-method)
  - [Client Methods](#client-methods)
    - [Product Info](#product-info)
    - [databases](#databases)
    - [layouts](#layouts)
    - [scripts](#scripts)
    - [layout](#layout)
    - [Create Records](#create-records)
    - [Duplicate Record](#duplicate-record)
    - [Get Record Details](#get-record-details)
    - [List Records](#list-records)
    - [Find Records](#find-records)
    - [Edit Records](#edit-records)
    - [Delete Records](#delete-records)
    - [Trigger Script](#trigger-script)
    - [Run Multiple Scripts](#run-multiple-scripts)
    - [Upload Files](#upload-files)
    - [Set Session Globals](#set-session-globals)
  - [Utilities](#utilities)
    - [Record Id Utility](#record-id-utility)
      - [Record Id Utility Results](#record-id-utility-results)
    - [Field Data Utility](#field-data-utility)
      - [Field Data Utility Results](#field-data-utility-results)
    - [Transform Utility](#transform-utility)
      - [Transform Utility Results](#transform-utility-results)
    - [Container Data Utility](#container-data-utility)
    - [Databases Utility](#databases-utility)
    - [Product Info Utility](#product-info-utility)
  - [Additional Client Capabilities](#additional-client-capabilities)
    - [Data Merge](#data-merge)
    - [Custom Request Agents](#custom-request-agents)
    - [Custom Request Parameters](#custom-request-parameters)
    - [Proxies](#proxies)
- [Tests](#tests)
- [Dependencies](#dependencies)
- [Development Dependencies](#development-dependencies)

## License

MIT © Lui de la Parra

## Installation

```sh
npm install --save marpat fms-api-client
```

## Usage

### Introduction

The fms-api-client is a wrapper around the [FileMaker Data API](https://fm.mutesymphony.com/fmi/data/apidoc/). Much :heart: to FileMaker for their work on the Data API. This client attempts to follow the terminology and conventions used by FileMaker wherever possible. The client uses a lightweight datastore to hold Data API connections. For more information about datastore configuration see the [datastore connection section](#datastore-connection) and the [marpat project](https://github.com/Luidog/marpat).

Each client committed to the datastore will automatically handle Data API Sessions. If required, clients can also manually open or close their FileMaker sessions by calling either the `client.login()` method or the `client.logout()` method. To remove a client from a datastore and log out a session call `client.destroy()`. For more information on Data API Session handling see the [Data API sessions section](#data-api-sessions).

All client methods accept parameters as defined by FileMaker. The client also allows for an expanded parameter syntax designed to make interacting with the client easier. Scripts and portals can be defined as arrays. Find queries can be defined as either an object or an array. For more information on the syntax supported by the client see [the parameter syntax section](#parameter-syntax).

In addition to the expanded syntax the client will also automatically parse arrays, objects, and numbers to adhere to the requirements of the Data API. The `limit` and `offset` parameters can be either strings or a numbers. The client will also automatically convert `limit`, `find`, and `offset` parameters into their underscored conterparts as needed. Additionally, if a script result is valid JSON it will be automatically parsed for you by the client.

All methods on the client return promises and each method will reject with a message and code upon encountering an error. All messages and codes follow the FileMaker Data API codes where applicable.

The client will queue concurrent requests to the Data API. The client can be configured with a [concurrency setting](#client-creation). The client will attempt ensure that each request to the Data API is made with an valid token which is not in use. This behavior prevents request session collisions. For more information on Data API Session handling see the [request queue section](#request-queue).

The client also provides utility modules to aid in working with FileMaker Data API Results. The provided utility modules are `fieldData`, `recordId`, `containerData`, and `transform`. These utilities will accept and return either an object or an array objects. For more information on the utility modules see the [utilities section](#utilities).

### Parameter Syntax

The client supports the same parameter syntax as is found in the [Data API Documentation](https://fm.mutesymphony.com/fmi/data/apidoc/). Where appropriate and useful the client also allows additional parameters.

#### Script Array Syntax

The custom script parameter follows the following syntax:

```json
{
  "scripts": [
    {
      "name": "At Mos Eisley",
      "phase": "presort",
      "param": "awesome bar"
    },
    {
      "name": "First Shot",
      "phase": "prerequest",
      "param": "Han"
    },
    {
      "name": "Moof Milker",
      "param": "Greedo"
    }
  ]
}
```

> File [./examples/schema/scripts-array-schema.json](./examples/schema/scripts-array-schema.json)

Following the Data API, the `prerequest` phase occurs before executing request and sorting of records, the `presort` phase after executing request and before sorting records. Not specifying a phase will run the script after the request and sorting are executed.

**Note:** The FileMaker script and portal syntax will override the alternative scripts and portals parameter syntax.

#### Portals Array Syntax

The custom portals parameter follows the following syntax:

```json
{
  "portals": [
    { "name": "planets", "limit": 1, "offset": 1 },
    { "name": "vehicles", "limit": 2 }
  ]
}
```

> File [./examples/schema/portals-array-schema.json](./examples/schema/portals-array-schema.json)

If a portals array is not used all portals on a queried layout will be returned.

**Note:** The FileMaker script and portal syntax will override the alternative scripts and portals parameter syntax.

#### Data Syntax

Arrays and objects are stringified before being inserted into field or portal data.

```json
{
  "data": {
    "name": "Yoda",
    "Vehicles::name": "The Force"
  }
}
```

> File [./examples/schema/data-schema.json](./examples/schema/data-schema.json)
> Any property not nested in a `portalData` property will be moved into the `fieldData` property.

#### Sort Syntax

The client accepts the same sort parameters as the Data API.

```json
{
  "sort": [
    { "fieldName": "name", "sortOrder": "ascend" },
    { "fieldName": "modificationTimestamp", "sortOrder": "descend" }
  ]
}
```

> File [./examples/schema/sort-schema.json](./examples/schema/sort-schema.json)

#### Query Syntax

When using the `find` method a query is required. The query can either be a single json object or an array of json objects.

```json
{
  "query": [
    {
      "name": "Han solo",
      "Vehicles::name": "Millenium Falcon"
    },
    {
      "name": "Luke Skywalker",
      "Vehicles::name": "X-Wing Starfighter"
    },
    {
      "age": ">10000"
    }
  ]
}
```

> File [./examples/schema/query-schema.json](./examples/schema/query-schema.json)

### Datastore Connection

The connect method must be called before the FileMaker class is used. The connect method is not currently exposed by fms-api-client, but from the marpat dependency. marpat is a fork of camo. Thanks and love to [Scott Robinson](https://github.com/scottwrobinson) for his creation and maintenance of camo.

marpat is designed to allow the use of multiple datastores with the focus on encrypted file storage and project flexibility.

For more information on marpat and the different types of supported storage visit [marpat](https://github.com/Luidog/marpat)

```js
const { connect } = require('marpat');
connect('nedb://memory');
```

> Excerpt from [./examples/index.js](./examples/index.js#L27-L28)

### Client Creation

After connecting to a datastore you can import and create clients. A client is created using the create method on the Filemaker class. The FileMaker class accepts an object with the following properties:

| Property      |         Type         |                                       Description                                        |
| ------------- | :------------------: | :--------------------------------------------------------------------------------------: |
| database      | <code>String</code>  |                           The FileMaker database to connect to                           |
| server        | <code>String</code>  |   The FileMaker server to use as the host. **Note:** Must be an http or https Domain.    |
| user          | <code>String</code>  |      The FileMaker user account to be used when authenticating into the Data API .       |
| password      | <code>String</code>  |                          The FileMaker user account's password.                          |
| [name]        | <code>String</code>  |                                  A name for the client.                                  |
| [usage]       | <code>Boolean</code> |           Track Data API usage for this client. **Note:** Default is `true` .            |
| [timeout]     | <code>Number</code>  |       The default timeout time for requests **Note:** Default is 0, (no timeout).        |
| [concurrency] | <code>Number</code>  | The number of concurrent requests that will be made to FileMaker **Note:** Default is 1. |
| [proxy]       | <code>Object</code>  |                               settings for a proxy server                                |
| [agent]       | <code>Object</code>  |                          Settings for a custom request agent .                           |

:warning: You should only use the agent parameter when absolutely necessary. The Data API was designed to be used on https. Deviating from the intended use should be done with caution.

```js
const client = Filemaker.create({
  name: process.env.CLIENT_NAME,
  database: process.env.DATABASE,
  server: process.env.SERVER,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  usage: process.env.CLIENT_USAGE_TRACKING
});
```

> Excerpt from [./examples/index.js](./examples/index.js#L32-L39)

**Note:** The server must be an http or https domain.

A client can be used directly after saving it. The `client.save()` method takes no arguments and will either reject with an error or resolve with a useable client. The client will automatically handle Data API session creation and expiration. Once a client is saved it will be stored on the datastore for reuse later.

```js
    return client.save();
  })
  .then(client => authentication(client))
  .then(client => metadata(client))
  .then(client => creates(client))
  .then(client => duplicate(client))
  .then(client => gets(client))
  .then(client => lists(client))
  .then(client => finds(client))
  .then(client => edits(client))
  .then(client => scripts(client))
  .then(client => script(client))
  .then(client => globals(client))
  .then(client => deletes(client))
  .then(client => uploads(client))
  .then(client => utilities(client))
```

> Excerpt from [./examples/index.js](./examples/index.js#L42-L57)

A client can be removed using either the `client.destroy()` method, the `Filemaker.deleteOne(query)` method or the `Filemaker.deleteMany(query)` method.

**Note** Only the `client.destroy()` method will close a FileMaker session. Any client removed using the the `Filemaker.deleteOne(query)` method or the `Filemaker.deleteMany(query)` method will not log out before being destroyed.

### Client Use

A client can be used after it is created and saved or recalled from the datastore. The `Filemaker.find(query)` or `Filemaker.findOne(query)` methods can be used to recall clients. The `Filemaker.findOne(query)` method will return either one client or null. The `Filemaker.find(query)` will return either an empty array or an array of clients. All public methods on the client return promises.

```js
const createManyRecords = client =>
  Promise.all([
    client.create('Heroes', { name: 'Anakin Skywalker' }, { merge: true }),
    client.create('Heroes', { name: 'Obi-Wan' }, { merge: true }),
    client.create('Heroes', { name: 'Yoda' }, { merge: true })
  ]).then(result => log('create-many-records-example', result));
```

> Excerpt from [./examples/create.examples.js](./examples/create.examples.js#L28-L33)

Results:

```json
[
  {
    "name": "Anakin Skywalker",
    "recordId": "1138",
    "modId": "327"
  },
  {
    "name": "Obi-Wan",
    "recordId": "1138",
    "modId": "327"
  },
  {
    "name": "Yoda",
    "recordId": "1138",
    "modId": "327"
  }
]
```

> File [./examples/results/create-many-records-example.json](./examples/results/create-many-records-example.json)

### Request Queue

The client will automatically queue requests to the FileMaker Data API if there are no available sessions to make the request. The client will ensure that a session is not in use or expired before it uses a session token in a request. This functionality is designed to prevent session collisions. The client will open and use a new session up to the configured concurrency limit. The concurrency limit is set when a client is created. By default the concurrency limit is one.

### Data API Sessions

The client will automatically handle creating and closing Data API sessions. If a new session is required the client will authenticate and generate a new session or queue requests if the session limit has been reached.

The Data API session is also monitored, updated, and saved as the client interacts with the Data API. The client will always attempt to reuse a valid token whenever possible.

The client contains two methods related to Data API sessions. These methods are `client.login()` and `client.logout()`. The login method is used to start a Data API session and the logout method will end a Data API session.

#### Login Method

The client will automatically call the login method if it does not have a valid token. This method returns an object with a token property. This method will also save the token to the client's connection for future use.

`client.login()`

```js
const login = client =>
  client.login().then(result => log('client-login-example', result));
```

> Excerpt from [./examples/authentication.examples.js](./examples/authentication.examples.js#L6-L7)

#### Logout Method

The logout method is used to end a Data API session. This method will also remove the current client's authentication token.

`client.logout()`

```js
const logout = client =>
  client
    .login()
    .then(() => client.logout())
    .then(result => log('client-logout-example', result));
```

> Excerpt from [./examples/authentication.examples.js](./examples/authentication.examples.js#L11-L15)

### Client Methods

#### Product Info

A client can get server product info. The productInfo method will return metadata about the FileMaker server the client is configured to use.

`client.productInfo()`

```js
const productInfo = client =>
  client.productInfo().then(result => log('product-info-example', result));
```

> Excerpt from [./examples/metadata.examples.js](./examples/metadata.examples.js#L6-L7)

Result:

```json
{
  "name": "FileMaker Data API Engine",
  "buildDate": "03/27/2019",
  "version": "18.0.1.109",
  "dateFormat": "MM/dd/yyyy",
  "timeFormat": "HH:mm:ss",
  "timeStampFormat": "MM/dd/yyyy HH:mm:ss"
}
```

> File [./examples/results/product-info-example.json](./examples/results/product-info-example.json)

#### databases

A client can get the databases accessible using the configured credentials. This method will return all databases hosted by the currently configured server that the client can connect to. An alternative set of credentials can be passed to this method to check what databases alternate credentials are able to access.

`client.databases(credentials)`

```js
const databases = client =>
  client.databases().then(result => log('databases-info-example', result));
```

> Excerpt from [./examples/metadata.examples.js](./examples/metadata.examples.js#L11-L12)

Result:

```json
{
  "databases": [
    {
      "name": "fms-api-app"
    }
  ]
}
```

> File [./examples/results/databases-info-example.json](./examples/results/databases-info-example.json)

#### layouts

The layouts method will return a list of layouts accessible by the configured client.

`client.layouts()`

| Param     | Type                | Default                | Description                                            |
| --------- | ------------------- | ---------------------- | ------------------------------------------------------ |
| host      | <code>String</code> |                        | The host FileMaker server.                             |
| database  | <code>String</code> |                        | The FileMaker database to target.                      |
| [version] | <code>String</code> | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'. |

```js
const layouts = client =>
  client.layouts().then(result => log('layouts-example', result));
```

> Excerpt from [./examples/metadata.examples.js](./examples/metadata.examples.js#L16-L17)

Result:

```json
{
  "layouts": [
    {
      "name": "Parameter Storage Demo"
    },
    {
      "name": "Chalmuns"
    },
    {
      "name": "Card Windows",
      "isFolder": true,
      "folderLayoutNames": [
        {
          "name": "Authorization Window"
        }
      ]
    },
    {
      "name": "API Integration Layouts",
      "isFolder": true,
      "folderLayoutNames": [
        {
          "name": "authentication"
        }
      ]
    },
    {
      "name": "Base Tables",
      "isFolder": true,
      "folderLayoutNames": [
        {
          "name": "RequestLog"
        },
        {
          "name": "SyncLog"
        },
        {
          "name": "AuthenticationStore"
        }
      ]
    },
    {
      "name": "Heroes"
    },
    {
      "name": "Transform"
    },
    {
      "name": "Hero Search"
    },
    {
      "name": "Hero"
    },
    {
      "name": "Globals"
    },
    {
      "name": "Scripts"
    },
    {
      "name": "Logs"
    },
    {
      "name": "Planets"
    },
    {
      "name": "Driods"
    },
    {
      "name": "Vehicles"
    },
    {
      "name": "Species"
    },
    {
      "name": "Images"
    }
  ]
}
```

> File [./examples/results/layouts-example.json](./examples/results/layouts-example.json)

#### scripts

The scripts method will return metadata for the scripts accessible by the configured client.

`client.scripts()`

| Param     | Type                | Default                | Description                                            |
| --------- | ------------------- | ---------------------- | ------------------------------------------------------ |
| host      | <code>String</code> |                        | The host FileMaker server.                             |
| database  | <code>String</code> |                        | The FileMaker database to target.                      |
| [version] | <code>String</code> | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'. |

```js
const scripts = client =>
  client
    .scripts(process.env.LAYOUT)
    .then(result => log('scripts-example', result));
```

> Excerpt from [./examples/metadata.examples.js](./examples/metadata.examples.js#L28-L31)

Result:

```json
{
  "scripts": [
    {
      "name": "Upon Open",
      "isFolder": false
    },
    {
      "name": "FMS Triggered Script",
      "isFolder": false
    },
    {
      "name": "node-red-script",
      "isFolder": false
    },
    {
      "name": "example script",
      "isFolder": false
    },
    {
      "name": "Error Script",
      "isFolder": false
    },
    {
      "name": "Non JSON Script",
      "isFolder": false
    },
    {
      "name": "Create Droids",
      "isFolder": false
    },
    {
      "name": "Delete All Records",
      "isFolder": false
    },
    {
      "name": "Buttons",
      "folderScriptNames": [
        {
          "name": "New Clip Record",
          "isFolder": false
        },
        {
          "name": "Update Clip Button",
          "isFolder": false
        },
        {
          "name": "Replace Clip Record Data",
          "isFolder": false
        },
        {
          "name": "Delete All Clip Records",
          "isFolder": false
        },
        {
          "name": "Push all flagged clips",
          "isFolder": false
        },
        {
          "name": "Set Clipboard",
          "isFolder": false
        }
      ],
      "isFolder": true
    },
    {
      "name": "Collision Script",
      "isFolder": false
    }
  ]
}
```

> File [./examples/results/scripts-example.json](./examples/results/scripts-example.json)

#### layout

The layout method will get metadata for the specified layout.

`client.layout(layout)`

| Param     | Type                | Default                | Description                                            |
| --------- | ------------------- | ---------------------- | ------------------------------------------------------ |
| host      | <code>String</code> |                        | The host FileMaker server.                             |
| database  | <code>String</code> |                        | The FileMaker database to target.                      |
| layout    | <code>String</code> |                        | The database layout to use.                            |
| [version] | <code>String</code> | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'. |

```js
const layout = client =>
  client
    .layout(process.env.LAYOUT)
    .then(result => log('layout-details-example', result));
```

> Excerpt from [./examples/metadata.examples.js](./examples/metadata.examples.js#L21-L24)

Result:

```json
{
  "fieldMetaData": [
    {
      "name": "name",
      "type": "normal",
      "displayType": "editText",
      "result": "text",
      "global": false,
      "autoEnter": false,
      "fourDigitYear": false,
      "maxRepeat": 1,
      "maxCharacters": 0,
      "notEmpty": false,
      "numeric": false,
      "timeOfDay": false,
      "repetitionStart": 1,
      "repetitionEnd": 1
    },
    {
      "name": "image",
      "type": "normal",
      "displayType": "editText",
      "result": "container",
      "global": false,
      "autoEnter": false,
      "fourDigitYear": false,
      "maxRepeat": 1,
      "maxCharacters": 0,
      "notEmpty": false,
      "numeric": false,
      "timeOfDay": false,
      "repetitionStart": 1,
      "repetitionEnd": 1
    },
    {
      "name": "object",
      "type": "normal",
      "displayType": "editText",
      "result": "text",
      "global": false,
      "autoEnter": false,
      "fourDigitYear": false,
      "maxRepeat": 1,
      "maxCharacters": 0,
      "notEmpty": false,
      "numeric": false,
      "timeOfDay": false,
      "repetitionStart": 1,
      "repetitionEnd": 1
    },
    {
      "name": "array",
      "type": "normal",
      "displayType": "editText",
      "result": "text",
      "global": false,
      "autoEnter": false,
      "fourDigitYear": false,
      "maxRepeat": 1,
      "maxCharacters": 0,
      "notEmpty": false,
      "numeric": false,
      "timeOfDay": false,
      "repetitionStart": 1,
      "repetitionEnd": 1
    },
    {
      "name": "height",
      "type": "normal",
      "displayType": "editText",
      "result": "text",
      "global": false,
      "autoEnter": false,
      "fourDigitYear": false,
      "maxRepeat": 1,
      "maxCharacters": 0,
      "notEmpty": false,
      "numeric": false,
      "timeOfDay": false,
      "repetitionStart": 1,
      "repetitionEnd": 1
    },
    {
      "name": "id",
      "type": "normal",
      "displayType": "editText",
      "result": "text",
      "global": false,
      "autoEnter": true,
      "fourDigitYear": false,
      "maxRepeat": 1,
      "maxCharacters": 0,
      "notEmpty": false,
      "numeric": false,
      "timeOfDay": false,
      "repetitionStart": 1,
      "repetitionEnd": 1
    }
  ]
}
```

> File [./examples/results/layout-details-example.json](./examples/results/layout-details-example.json)

#### Create Records

Using the client you can create filemaker records. To create a record specify the layout to use and the data to insert on creation. The client will automatically convert numbers, arrays, and objects into strings so they can be inserted into a filemaker field. The create method will automatically create a `fieldData` property and add all data to that property if there is no fieldData property present. The client will preserve the contents of the `portalData` property.

`client.create(layout, data, parameters)`

| Param      | Type                | Description                                             |
| ---------- | ------------------- | ------------------------------------------------------- |
| layout     | <code>String</code> | The layout to use when creating a record.               |
| data       | <code>Object</code> | The data to use when creating a record.                 |
| parameters | <code>Object</code> | The request parameters to use when creating the record. |

| Param     | Type                | Default                | Description                                            |
| --------- | ------------------- | ---------------------- | ------------------------------------------------------ |
| host      | <code>String</code> |                        | The host FileMaker server.                             |
| database  | <code>String</code> |                        | The FileMaker database to target.                      |
| layout    | <code>String</code> |                        | The database layout to use.                            |
| [version] | <code>String</code> | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'. |

```js
const createRecord = client =>
  client
    .create('Heroes', {
      name: 'George Lucas'
    })
    .then(result => log('create-record-example', result));
```

> Excerpt from [./examples/create.examples.js](./examples/create.examples.js#L6-L11)

Result:

```json
{
  "recordId": "1138",
  "modId": "327"
}
```

> File [./examples/results/create-record-example.json](./examples/results/create-record-example.json)

The create method also allows you to trigger scripts when creating a record. Notice the scripts property in the following example. You can specify scripts to run using either FileMaker's script.key syntax or specify an array of in a `scripts` property. The script objects should have with `name`, optional `phase`, and optional `params` parameters. For more information see the scripts syntax example in the introduction.

```js
const triggerScriptsOnCreate = client =>
  client
    .create(
      'Heroes',
      { name: 'Anakin Skywalker' },
      {
        merge: true,
        scripts: [
          { name: 'Create Droids', param: { droids: ['C3-PO', 'R2-D2'] } }
        ]
      }
    )
    .then(result => log('trigger-scripts-on-create-example', result));
```

> Excerpt from [./examples/create.examples.js](./examples/create.examples.js#L37-L49)

Result:

```json
{
  "name": "Anakin Skywalker",
  "scriptError": "0",
  "recordId": "1138",
  "modId": "327"
}
```

> File [./examples/results/trigger-scripts-on-create-example.json](./examples/results/trigger-scripts-on-create-example.json)

#### Duplicate Record

The duplicate method duplicates the FileMaker record using the layout and recordId parameters passed to it.

`client.duplicate(layout, recordId, parameters)`

| Param     | Type                | Default                | Description                                            |
| --------- | ------------------- | ---------------------- | ------------------------------------------------------ |
| host      | <code>String</code> |                        | The host FileMaker server.                             |
| database  | <code>String</code> |                        | The FileMaker database to target.                      |
| layout    | <code>String</code> |                        | The database layout to use.                            |
| recordId  | <code>String</code> |                        | The FileMaker internal record id to duplicate.         |
| [version] | <code>String</code> | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'. |

```js
client
  .duplicate('Heroes', response.data[0].recordId)
  .then(result => log('duplicate-record-example', result));
```

> Excerpt from [./examples/duplicate.examples.js](./examples/duplicate.examples.js#L9-L11)

Result:

```json
{
  "recordId": "1138",
  "modId": "327"
}
```

> File [./examples/results/duplicate-record-example.json](./examples/results/duplicate-record-example.json)

The duplicate method also allows you to trigger scripts when duplicating a record. Notice the scripts property in the following example. You can specify scripts to run using either FileMaker's script.key syntax or specify an array of in a `scripts` property. The script objects should have with `name`, optional `phase`, and optional `params` parameters. For more information see the scripts syntax example in the introduction.

```js
const triggerScriptsOnCreate = client =>
  client
    .create(
      'Heroes',
      { name: 'Anakin Skywalker' },
      {
        merge: true,
        scripts: [
          { name: 'Create Droids', param: { droids: ['C3-PO', 'R2-D2'] } }
        ]
      }
    )
    .then(result => log('trigger-scripts-on-create-example', result));
```

> Excerpt from [./examples/create.examples.js](./examples/create.examples.js#L37-L49)

Result:

```json
{
  "name": "Anakin Skywalker",
  "scriptError": "0",
  "recordId": "1138",
  "modId": "327"
}
```

> File [./examples/results/trigger-scripts-on-create-example.json](./examples/results/trigger-scripts-on-create-example.json)

#### Get Record Details

The Get method will return a specific FileMaker record based on the recordId passed to it. The recordId can be a string or a number.

`client.get(layout, recordId, parameters)`

| Param      | Type                | Description                                                         |
| ---------- | ------------------- | ------------------------------------------------------------------- |
| layout     | <code>String</code> | The layout to use when retrieving the record.                       |
| recordId   | <code>String</code> | The FileMaker internal record ID to use when retrieving the record. |
| parameters | <code>Object</code> | Parameters to add for the get query.                                |

| Param     | Type                | Default                | Description                                            |
| --------- | ------------------- | ---------------------- | ------------------------------------------------------ |
| host      | <code>String</code> |                        | The host FileMaker server.                             |
| database  | <code>String</code> |                        | The FileMaker database to target.                      |
| layout    | <code>String</code> |                        | The database layout to use.                            |
| recordId  | <code>String</code> |                        | The FileMaker internal record id to update.            |
| [version] | <code>String</code> | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'. |

```js
client
  .get('Heroes', response.data[0].recordId)
  .then(result => log('get-record-example', result));
```

> Excerpt from [./examples/get.examples.js](./examples/get.examples.js#L9-L11)

Result:

```json
{
  "dataInfo": {
    "database": "fms-api-app",
    "layout": "Heroes",
    "table": "Heroes",
    "totalRecordCount": "1977",
    "foundCount": 1,
    "returnedCount": 1
  },
  "data": [
    {
      "fieldData": {
        "name": "Yoda",
        "image": "https://some-server.com/Streaming_SSL/MainDB/3366F0CD95024C7C6A52B2CA623E295B751EE52118C72CD3DAB690D6F4B2992F?RCType=EmbeddedRCFileProcessor",
        "object": "",
        "array": "",
        "height": "",
        "id": "r2d2-c3po-l3-37-bb-8",
        "imageName": "placeholder.md",
        "creationAccountName": "obi-wan",
        "creationTimestamp": "05/25/1977 6:00:00",
        "modificationAccountName": "obi-wan",
        "modificationTimestamp": "05/25/1977 6:00:00",
        "Vehicles::name": "",
        "hash": "?"
      },
      "portalData": {
        "Planets": [],
        "Vehicles": []
      },
      "recordId": "1138",
      "modId": "327",
      "portalDataInfo": [
        {
          "database": "fms-api-app",
          "table": "Planets",
          "foundCount": 0,
          "returnedCount": 0
        },
        {
          "database": "fms-api-app",
          "table": "Vehicles",
          "foundCount": 0,
          "returnedCount": 0
        }
      ]
    }
  ]
}
```

> File [./examples/results/get-record-example.json](./examples/results/get-record-example.json)

#### List Records

You can use the client to list filemaker records. The list method accepts a layout and parameter variable. The client will automatically santize the limit, offset, and sort keys to correspond with the DAPI's requirements.

`client.list(layout, parameters)`

| Param      | Type                | Description                                   |
| ---------- | ------------------- | --------------------------------------------- |
| layout     | <code>String</code> | The layout to use when retrieving the record. |
| parameters | <code>Object</code> | the parameters to use to modify the query.    |

| Param     | Type                | Default                | Description                                            |
| --------- | ------------------- | ---------------------- | ------------------------------------------------------ |
| host      | <code>String</code> |                        | The host FileMaker server.                             |
| database  | <code>String</code> |                        | The FileMaker database to target.                      |
| layout    | <code>String</code> |                        | The database layout to use.                            |
| [version] | <code>String</code> | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'. |

```js
const listHeroes = client =>
  client
    .list('Heroes', { limit: 2 })
    .then(result => log('list-records-example', result));
```

> Excerpt from [./examples/list.examples.js](./examples/list.examples.js#L6-L9)

Result:

```json
{
  "dataInfo": {
    "database": "fms-api-app",
    "layout": "Heroes",
    "table": "Heroes",
    "totalRecordCount": "1977",
    "foundCount": 35148,
    "returnedCount": 2
  },
  "data": [
    {
      "fieldData": {
        "name": "George Lucas",
        "image": "https://some-server.com/Streaming_SSL/MainDB/3D843169A9D86D5BD59B9B67BC69A466199772613B88C7F04F426866429DDA31.png?RCType=EmbeddedRCFileProcessor",
        "object": "",
        "array": "",
        "height": "",
        "id": "r2d2-c3po-l3-37-bb-8",
        "imageName": "IMG_0001.PNG",
        "creationAccountName": "obi-wan",
        "creationTimestamp": "05/25/1977 6:00:00",
        "modificationAccountName": "obi-wan",
        "modificationTimestamp": "05/25/1977 6:00:00",
        "Vehicles::name": "test",
        "hash": ""
      },
      "portalData": {
        "Planets": [],
        "Vehicles": [
          {
            "recordId": "1138",
            "Vehicles::name": "test",
            "Vehicles::type": "",
            "modId": "327"
          }
        ]
      },
      "recordId": "1138",
      "modId": "327",
      "portalDataInfo": [
        {
          "database": "fms-api-app",
          "table": "Planets",
          "foundCount": 0,
          "returnedCount": 0
        },
        {
          "database": "fms-api-app",
          "table": "Vehicles",
          "foundCount": 1,
          "returnedCount": 1
        }
      ]
    },
    {
      "fieldData": {
        "name": "George Lucas",
        "image": "",
        "object": "",
        "array": "",
        "height": "",
        "id": "r2d2-c3po-l3-37-bb-8",
        "imageName": "",
        "creationAccountName": "obi-wan",
        "creationTimestamp": "05/25/1977 6:00:00",
        "modificationAccountName": "obi-wan",
        "modificationTimestamp": "05/25/1977 6:00:00",
        "Vehicles::name": "",
        "hash": "?"
      },
      "portalData": {
        "Planets": [],
        "Vehicles": []
      },
      "recordId": "1138",
      "modId": "327",
      "portalDataInfo": [
        {
          "database": "fms-api-app",
          "table": "Planets",
          "foundCount": 0,
          "returnedCount": 0
        },
        {
          "database": "fms-api-app",
          "table": "Vehicles",
          "foundCount": 0,
          "returnedCount": 0
        }
      ]
    }
  ]
}
```

> File [./examples/results/list-records-example.json](./examples/results/list-records-example.json)

#### Find Records

The client's find method will accept either a single object as find parameters or an array. The find method will also santize the limit, sort, and offset parameters to conform with the Data API's requirements.

`client.find(layout, query, parameters)`

| Param      | Type                | Description                                 |
| ---------- | ------------------- | ------------------------------------------- |
| layout     | <code>String</code> | The layout to use when performing the find. |
| query      | <code>Object</code> | to use in the find request.                 |
| parameters | <code>Object</code> | the parameters to use to modify the query.  |

| Param     | Type                | Default                | Description                                            |
| --------- | ------------------- | ---------------------- | ------------------------------------------------------ |
| host      | <code>String</code> |                        | The host FileMaker server.                             |
| database  | <code>String</code> |                        | The FileMaker database to target.                      |
| layout    | <code>String</code> |                        | The database layout to use.                            |
| [version] | <code>String</code> | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'. |

```js
const findRecords = client =>
  client
    .find('Heroes', [{ name: 'Anakin Skywalker' }], { limit: 1 })
    .then(result => log('find-records-example', result));
```

> Excerpt from [./examples/find.examples.js](./examples/find.examples.js#L6-L9)

Result:

```json
{
  "dataInfo": {
    "database": "fms-api-app",
    "layout": "Heroes",
    "table": "Heroes",
    "totalRecordCount": "1977",
    "foundCount": 135,
    "returnedCount": 1
  },
  "data": [
    {
      "fieldData": {
        "name": "Anakin Skywalker",
        "image": "",
        "object": "",
        "array": "",
        "height": "",
        "id": "r2d2-c3po-l3-37-bb-8",
        "imageName": "",
        "creationAccountName": "obi-wan",
        "creationTimestamp": "05/25/1977 6:00:00",
        "modificationAccountName": "obi-wan",
        "modificationTimestamp": "05/25/1977 6:00:00",
        "Vehicles::name": "",
        "hash": ""
      },
      "portalData": {
        "Planets": [],
        "Vehicles": []
      },
      "recordId": "1138",
      "modId": "327",
      "portalDataInfo": [
        {
          "database": "fms-api-app",
          "table": "Planets",
          "foundCount": 0,
          "returnedCount": 0
        },
        {
          "database": "fms-api-app",
          "table": "Vehicles",
          "foundCount": 0,
          "returnedCount": 0
        }
      ]
    }
  ]
}
```

> File [./examples/results/find-records-example.json](./examples/results/find-records-example.json)

#### Edit Records

The client's edit method requires a layout, recordId, and object to use for updating the record.

`client.edit(layout, recordId, data, parameters)`

| Param      | Type                | Description                                                      |
| ---------- | ------------------- | ---------------------------------------------------------------- |
| layout     | <code>String</code> | The layout to use when editing the record.                       |
| recordId   | <code>String</code> | The FileMaker internal record ID to use when editing the record. |
| data       | <code>Object</code> | The data to use when editing a record.                           |
| parameters | <code>Object</code> | parameters to use when performing the query.                     |

```js
const editRecord = client =>
  client
    .find('Heroes', [{ name: 'Anakin Skywalker' }], { limit: 1 })
    .then(response => response.data[0].recordId)
    .then(recordId => client.edit('Heroes', recordId, { name: 'Darth Vader' }))
    .then(result => log('edit-record-example', result));
```

> Excerpt from [./examples/edit.examples.js](./examples/edit.examples.js#L6-L11)

Result:

```json
{
  "modId": "327"
}
```

> File [./examples/results/edit-record-example.json](./examples/results/edit-record-example.json)

#### Delete Records

The client's delete method requires a layout and a record id. The recordId can be a number or a string.

`client.delete(layout, recordId, parameters)`

| Param    | Type                | Description                                                      |
| -------- | ------------------- | ---------------------------------------------------------------- |
| layout   | <code>String</code> | The layout to use when deleting the record.                      |
| recordId | <code>String</code> | The FileMaker internal record ID to use when editing the record. |

| Param     | Type                | Default                | Description                                            |
| --------- | ------------------- | ---------------------- | ------------------------------------------------------ |
| host      | <code>String</code> |                        | The host FileMaker server.                             |
| database  | <code>String</code> |                        | The FileMaker database to target.                      |
| layout    | <code>String</code> |                        | The database layout to use.                            |
| recordId  | <code>String</code> |                        | The FileMaker internal record id to update.            |
| [version] | <code>String</code> | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'. |

```js
const deleteRecords = client =>
  client
    .find('Heroes', [{ name: 'yoda' }], { limit: 1 })
    .then(response => response.data[0].recordId)
    .then(recordId => client.delete('Heroes', recordId))
    .then(result => log('delete-record-example', result));
```

> Excerpt from [./examples/delete.examples.js](./examples/delete.examples.js#L6-L11)

Result:

```json
{}
```

> File [./examples/results/delete-record-example.json](./examples/results/delete-record-example.json)

#### Trigger Script

The client's script method will trigger a script. You can also trigger scripts with the create, edit, list, find, and delete methods. This method performs a list with a limit of one on the specified layout before triggering the script. this is the most lightweight request possible while still being able to trigger a script.

`client.script(layout, script, param, parameters)`

| Param  | Type                                       | Description                            |
| ------ | ------------------------------------------ | -------------------------------------- |
| layout | <code>String</code>                        | The layout to use for the list request |
| script | <code>String</code>                        | The name of the script                 |
| param  | <code>Object</code> \| <code>String</code> | Parameter to pass to the script        |
| param  | <code>Object</code>                        | Parameter to pass to the script        |

| Param       | Type                                                              | Default                | Description                                              |
| ----------- | ----------------------------------------------------------------- | ---------------------- | -------------------------------------------------------- |
| host        | <code>String</code>                                               |                        | The host FileMaker server.                               |
| database    | <code>String</code>                                               |                        | The FileMaker database to target.                        |
| layout      | <code>String</code>                                               |                        | The database layout to use.                              |
| script      | <code>String</code>                                               |                        | The name of the script to run .                          |
| [parameter] | <code>String</code> \| <code>Object</code> \| <code>Number</code> |                        | Optional script parameters to pass to the called script. |
| [version]   | <code>String</code>                                               | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'.   |

```js
const triggerScript = client =>
  client
    .script('Heroes', 'FMS Triggered Script', { name: 'Han' })
    .then(result => log('script-trigger-example', result));
```

> Excerpt from [./examples/script.examples.js](./examples/script.examples.js#L6-L9)

Result:

```json
{
  "scriptResult": {
    "answer": "Han shot first"
  },
  "scriptError": "0"
}
```

> File [./examples/results/script-trigger-example.json](./examples/results/script-trigger-example.json)

#### Run Multiple Scripts

The client's script method will trigger a script. You can also trigger scripts with the create, edit, list, find, and delete methods. This method performs a list with a limit of one on the specified layout before triggering the script. this is the most lightweight request possible while still being able to trigger a script.

`client.run(layout, scripts,parameters)`

| Param      | Type                                      | Description                            |
| ---------- | ----------------------------------------- | -------------------------------------- |
| layout     | <code>String</code>                       | The layout to use for the list request |
| scripts    | <code>Object</code> \| <code>Array</code> | The name of the script                 |
| parameters | <code>Object</code>                       | Parameters to pass to the script       |

```js
const runMultipleScripts = client =>
  client
    .run('Heroes', [
      { name: 'FMS Triggered Script', param: { name: 'Han' } },
      { name: 'FMS Triggered Script', phase: 'presort', param: { name: 'Han' } }
    ])
    .then(result => log('run-scripts-example', result));
```

> Excerpt from [./examples/scripts.examples.js](./examples/scripts.examples.js#L27-L33)

Result:

```json
{
  "scriptResult.presort": {
    "answer": "Han shot first"
  },
  "scriptResult": {
    "answer": "Han shot first"
  }
}
```

> File [./examples/results/run-scripts-example.json](./examples/results/run-scripts-example.json)

#### Upload Files

The upload method will upload binary data to a container. The file parameter should be either a path to a file or a buffer. If you need to set a field repetition, you can set that in parameters. If recordId is 0 or undefined a new record will be created.

`client.upload(file, layout, container, recordId, parameters)`

| Param              | Type                                       | Description                                                                              |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| file               | <code>String</code>                        | The path to the file to upload.                                                          |
| layout             | <code>String</code>                        | The layout to use when performing the find.                                              |
| containerFieldName | <code>String</code>                        | The field name to insert the data into. It must be a container field.                    |
| recordId           | <code>Number</code> \| <code>String</code> | the recordId to use when uploading the file.                                             |
| fieldRepetition    | <code>Number</code>                        | The field repetition to use when inserting into a container field. by default this is 1. |

| Param             | Type                                       | Default                | Description                                                            |
| ----------------- | ------------------------------------------ | ---------------------- | ---------------------------------------------------------------------- |
| host              | <code>String</code>                        |                        | The host FileMaker server.                                             |
| database          | <code>String</code>                        |                        | The FileMaker database to target.                                      |
| layout            | <code>String</code>                        |                        | The database layout to use.                                            |
| recordId          | <code>String</code>                        |                        | the record id to use when inserting the file.                          |
| fieldName         | <code>String</code>                        |                        | the field to use when inserting a file.                                |
| [fieldRepetition] | <code>String</code> \| <code>Number</code> | <code>1</code>         | The field repetition to use when inserting the file. The default is 1. |
| [version]         | <code>String</code>                        | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'.                 |

```js
const uploadImage = client =>
  client
    .upload('./assets/placeholder.md', 'Heroes', 'image')
    .then(result => log('upload-image-example', result));
```

> Excerpt from [./examples/upload.examples.js](./examples/upload.examples.js#L6-L9)

Result:

```json
{
  "modId": "327",
  "recordId": "1138"
}
```

> File [./examples/results/upload-image-example.json](./examples/results/upload-image-example.json)

You can also provide a record Id to the upload method and the file will be uploaded to that
record.

```js
          client
            .upload('./assets/placeholder.md', 'Heroes', 'image', recordId)
            .then(result => log('upload-specific-record-example', result))
            .catch(error => error),
```

> Excerpt from [./examples/upload.examples.js](./examples/upload.examples.js#L20-L23)

Result:

```json
{
  "modId": "327",
  "recordId": "1138"
}
```

> File [./examples/results/upload-specific-record-example.json](./examples/results/upload-specific-record-example.json)

#### Set Session Globals

The globals method will set global fields for the current session.

`client.globals(data, parameters)`

| Param | Type                                      | Description                                           |
| ----- | ----------------------------------------- | ----------------------------------------------------- |
| data  | <code>Object</code> \| <code>Array</code> | a json object containing the name value pairs to set. |

| Param     | Type                | Default                | Description                                            |
| --------- | ------------------- | ---------------------- | ------------------------------------------------------ |
| host      | <code>String</code> |                        | The host FileMaker server.                             |
| database  | <code>String</code> |                        | The FileMaker database to target.                      |
| layout    | <code>String</code> |                        | The database layout to use.                            |
| [version] | <code>String</code> | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'. |

```js
const setGlobals = client =>
  client
    .globals({ 'Globals::ship': 'Millenium Falcon' })
    .then(result => log('set-globals-example', result));
```

> Excerpt from [./examples/globals.examples.js](./examples/globals.examples.js#L6-L9)

Result:

```json
{}
```

> File [./examples/results/set-globals-example.json](./examples/results/set-globals-example.json)

### Utilities

The client also provides utilities to aid in parsing and manipulating FileMaker Data. The client exports the `recordId(data)`, `fieldData(data)`, and `transform(data, options)` to aid in transforming Data API response data into other formats. Each utility is capable of recieving either an object or a array.

#### Record Id Utility

The record id utility retrieves the `recordId` properties for a response. This utility will return either a single string or an array of strings.

`recordId(data)`

| Param | Type                                      | Description                                                                |
| ----- | ----------------------------------------- | -------------------------------------------------------------------------- |
| data  | <code>Object</code> \| <code>Array</code> | the raw data returned from a filemaker. This can be an array or an object. |

```js
const extractRecordIdOriginal = client =>
  client
    .find('Heroes', { name: 'yoda' }, { limit: 2 })
    .then(response => recordId(response.data))
    .then(result => log('record-id-utility-example', result));
```

> Excerpt from [./examples/utility.examples.js](./examples/utility.examples.js#L22-L26)

##### Record Id Utility Results

original:

```json
[
  {
    "fieldData": {
      "name": "yoda",
      "image": "https://some-server.com/Streaming_SSL/MainDB/D6E066BD0912B601DEA2E21D7FFEC768EAACD3949D6C71FD49F8FFEBA0DBC511?RCType=EmbeddedRCFileProcessor",
      "object": "",
      "array": "",
      "height": "",
      "id": "r2d2-c3po-l3-37-bb-8",
      "imageName": "placeholder.md",
      "creationAccountName": "obi-wan",
      "creationTimestamp": "05/25/1977 6:00:00",
      "modificationAccountName": "obi-wan",
      "modificationTimestamp": "05/25/1977 6:00:00",
      "Vehicles::name": "",
      "hash": "?"
    },
    "portalData": {
      "Planets": [],
      "Vehicles": []
    },
    "recordId": "1138",
    "modId": "327",
    "portalDataInfo": [
      {
        "database": "fms-api-app",
        "table": "Planets",
        "foundCount": 0,
        "returnedCount": 0
      },
      {
        "database": "fms-api-app",
        "table": "Vehicles",
        "foundCount": 0,
        "returnedCount": 0
      }
    ]
  },
  {
    "fieldData": {
      "name": "Yoda",
      "image": "",
      "object": "",
      "array": "",
      "height": "",
      "id": "r2d2-c3po-l3-37-bb-8",
      "imageName": "",
      "creationAccountName": "obi-wan",
      "creationTimestamp": "05/25/1977 6:00:00",
      "modificationAccountName": "obi-wan",
      "modificationTimestamp": "05/25/1977 6:00:00",
      "Vehicles::name": "",
      "hash": "?"
    },
    "portalData": {
      "Planets": [],
      "Vehicles": []
    },
    "recordId": "1138",
    "modId": "327",
    "portalDataInfo": [
      {
        "database": "fms-api-app",
        "table": "Planets",
        "foundCount": 0,
        "returnedCount": 0
      },
      {
        "database": "fms-api-app",
        "table": "Vehicles",
        "foundCount": 0,
        "returnedCount": 0
      }
    ]
  }
]
```

> File [./examples/results/record-id-utility-original-example.json](./examples/results/record-id-utility-original-example.json)

Transformed:

```json
["751329", "751394"]
```

> File [./examples/results/record-id-utility-example.json](./examples/results/record-id-utility-example.json)

#### Field Data Utility

The field data utility retrieves the `fieldData`, `recordId`, and `modId` properties from a Data API response. The fieldData utility will merge the `recordId` and `modId` properties into fielData properties. This utility will not convert `table::field` properties.

`fieldData(data)`

| Param | Type                                      | Description                                                                |
| ----- | ----------------------------------------- | -------------------------------------------------------------------------- |
| data  | <code>Object</code> \| <code>Array</code> | The raw data returned from a filemaker. This can be an array or an object. |

```js
const extractFieldData = client =>
  client
    .find('Heroes', { name: 'yoda' }, { limit: 2 })
    .then(response => fieldData(response.data))
    .then(result => log('field-data-utility-example', result));
```

> Excerpt from [./examples/utility.examples.js](./examples/utility.examples.js#L38-L42)

##### Field Data Utility Results

Original:

```json
[
  {
    "fieldData": {
      "name": "yoda",
      "image": "https://some-server.com/Streaming_SSL/MainDB/4DA2FB32FD624486C5BE37662EDBAE56B448CC2F9912481EDBB08164AD38E4FF?RCType=EmbeddedRCFileProcessor",
      "object": "",
      "array": "",
      "height": "",
      "id": "r2d2-c3po-l3-37-bb-8",
      "imageName": "placeholder.md",
      "creationAccountName": "obi-wan",
      "creationTimestamp": "05/25/1977 6:00:00",
      "modificationAccountName": "obi-wan",
      "modificationTimestamp": "05/25/1977 6:00:00",
      "Vehicles::name": "",
      "hash": "?"
    },
    "portalData": {
      "Planets": [],
      "Vehicles": []
    },
    "recordId": "1138",
    "modId": "327",
    "portalDataInfo": [
      {
        "database": "fms-api-app",
        "table": "Planets",
        "foundCount": 0,
        "returnedCount": 0
      },
      {
        "database": "fms-api-app",
        "table": "Vehicles",
        "foundCount": 0,
        "returnedCount": 0
      }
    ]
  },
  {
    "fieldData": {
      "name": "Yoda",
      "image": "",
      "object": "",
      "array": "",
      "height": "",
      "id": "r2d2-c3po-l3-37-bb-8",
      "imageName": "",
      "creationAccountName": "obi-wan",
      "creationTimestamp": "05/25/1977 6:00:00",
      "modificationAccountName": "obi-wan",
      "modificationTimestamp": "05/25/1977 6:00:00",
      "Vehicles::name": "",
      "hash": "?"
    },
    "portalData": {
      "Planets": [],
      "Vehicles": []
    },
    "recordId": "1138",
    "modId": "327",
    "portalDataInfo": [
      {
        "database": "fms-api-app",
        "table": "Planets",
        "foundCount": 0,
        "returnedCount": 0
      },
      {
        "database": "fms-api-app",
        "table": "Vehicles",
        "foundCount": 0,
        "returnedCount": 0
      }
    ]
  }
]
```

> File [./examples/results/field-data-utility-original-example.json](./examples/results/field-data-utility-original-example.json)

Transformed:

```json
[
  {
    "name": "yoda",
    "image": "https://some-server.com/Streaming_SSL/MainDB/332651C476F791617118B74B1F64A731E5C6D6119F3BB4DC552AE5CF19C43E2F?RCType=EmbeddedRCFileProcessor",
    "object": "",
    "array": "",
    "height": "",
    "id": "r2d2-c3po-l3-37-bb-8",
    "imageName": "placeholder.md",
    "creationAccountName": "obi-wan",
    "creationTimestamp": "05/25/1977 6:00:00",
    "modificationAccountName": "obi-wan",
    "modificationTimestamp": "05/25/1977 6:00:00",
    "Vehicles::name": "",
    "hash": "?",
    "recordId": "1138",
    "modId": "327"
  },
  {
    "name": "Yoda",
    "image": "",
    "object": "",
    "array": "",
    "height": "",
    "id": "r2d2-c3po-l3-37-bb-8",
    "imageName": "",
    "creationAccountName": "obi-wan",
    "creationTimestamp": "05/25/1977 6:00:00",
    "modificationAccountName": "obi-wan",
    "modificationTimestamp": "05/25/1977 6:00:00",
    "Vehicles::name": "",
    "hash": "?",
    "recordId": "1138",
    "modId": "327"
  }
]
```

> File [./examples/results/field-data-utility-example.json](./examples/results/field-data-utility-example.json)

#### Transform Utility

The transform utility converts Data API response data by converting `table::field` properties into objects. This utility will traverse the response data converting `{ table::field : value}` properties to `{ table:{ field : value } }`. This utility will also convert `portalData` into arrays of objects.

The transform utility accepts three option properties. The three option properties are all booleans and true by default. The properties are `convert`,`fieldData`,`portalData`. The `convert` property toggles the transformation of `table::field` properties. The `fieldData` property toggles merging of fieldData to the result. The `portalData` property toggles merging portalData to the result. Setting any property to false will turn that transformation off.

`transform(data, parameters)`

| Param  | Type                | Description                                    |
| ------ | ------------------- | ---------------------------------------------- |
| object | <code>Object</code> | The response recieved from the FileMaker DAPI. |

```js
const transformData = client =>
  client
    .find('Transform', { name: 'Han Solo' }, { limit: 1 })
    .then(result => transform(result.data))
    .then(result => log('transform-utility-example', result));
```

> Excerpt from [./examples/utility.examples.js](./examples/utility.examples.js#L46-L50)

##### Transform Utility Results

Original:

```json
[
  {
    "fieldData": {
      "starships": "",
      "vehicles": "",
      "species": "",
      "biography": "",
      "birthYear": "",
      "id": "r2d2-c3po-l3-37-bb-8",
      "name": "Han Solo"
    },
    "portalData": {
      "Planets": [
        {
          "recordId": "1138",
          "Planets::name": "Coriella",
          "modId": "327"
        }
      ],
      "Vehicles": [
        {
          "recordId": "1138",
          "Vehicles::name": "Millenium Falcon",
          "Vehicles::type": "Starship",
          "modId": "327"
        }
      ]
    },
    "recordId": "1138",
    "modId": "327",
    "portalDataInfo": [
      {
        "database": "fms-api-app",
        "table": "Planets",
        "foundCount": 1,
        "returnedCount": 1
      },
      {
        "database": "fms-api-app",
        "table": "Vehicles",
        "foundCount": 1,
        "returnedCount": 1
      }
    ]
  }
]
```

> File [./examples/results/transform-utility-original-example.json](./examples/results/transform-utility-original-example.json)

Transformed:

```json
[
  {
    "starships": "",
    "vehicles": "",
    "species": "",
    "biography": "",
    "birthYear": "",
    "id": "r2d2-c3po-l3-37-bb-8",
    "name": "Han Solo",
    "Planets": [
      {
        "recordId": "1138",
        "name": "Coriella",
        "modId": "327"
      }
    ],
    "Vehicles": [
      {
        "recordId": "1138",
        "name": "Millenium Falcon",
        "type": "Starship",
        "modId": "327"
      }
    ],
    "recordId": "1138",
    "modId": "327"
  }
]
```

> File [./examples/results/transform-utility-example.json](./examples/results/transform-utility-example.json)

#### Container Data Utility

The container data utility will retrieve FileMaker container data by following the links returned by the Data API. This utility will accept either a single data object or an array of objects. The utility will use the `field` parameter to target container data urls in the data parameter. This utility also requires a `name` parameter which will be used to target a data property that should be used as the file's name. If a name parameter is provided that is not a property or nested property in the `data` parameter, the name parameter itself will be used. The `destination` parameter should be either 'buffer' to indicate that an object with a file's name and buffer should be returned or the path, relative to the current working directory, where the utility should write container data to a file. This utility will also accept optional request `parameters` to modify the http request.

`containerData(data, field, destination, name, parameters)`

| Param                | Type                                      | Description                                                                   |
| -------------------- | ----------------------------------------- | ----------------------------------------------------------------------------- |
| data                 | <code>Object</code> \| <code>Array</code> | The response recieved from the FileMaker DAPI.                                |
| field                | <code>String</code>                       | The container field name to target. This can be a nested property.            |
| destination          | <code>String</code>                       | "buffer" if a buffer object should be returned or the path to write the file. |
| name                 | <code>String</code>                       | The field to use for the file name or a static string.                        |
| [parameters]         | <code>Object</code>                       | Request configuration parameters.                                             |
| [parameters.timeout] | <code>Number</code>                       | a timeout for the request.                                                    |

```js
const getContainerData = client =>
  client
    .find('Heroes', { imageName: '*' }, { limit: 1 })
    .then(result =>
      containerData(
        result.data,
        'fieldData.image',
        './assets',
        'fieldData.imageName'
      )
    )
    .then(result => log('container-data-example', result));
```

> Excerpt from [./examples/utility.examples.js](./examples/utility.examples.js#L71-L82)

Result:

```json
[
  {
    "name": "IMG_0001.PNG",
    "path": "assets/IMG_0001.PNG"
  }
]
```

> File [./examples/results/container-data-example.json](./examples/results/container-data-example.json)

#### Databases Utility

The databases utility will get the accessible databases for the server and credentials passed to it.

`databases(server, credentials, version, parameters)`

| Param         | Type                | Default                | Description                                            |
| ------------- | ------------------- | ---------------------- | ------------------------------------------------------ |
| host          | <code>String</code> |                        | The host FileMaker server.                             |
| [credentials] | <code>String</code> |                        | Credentials to use when getting a list of databases.   |
| [version]     | <code>String</code> | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'. |
| [parameters]  | <code>Object</code> |                        | Request configuration parameters.                      |

```js
const getDatabases = client =>
  databases(client.server, client.credentials).then(result =>
    log('databases-utility-example', result)
  );
```

> Excerpt from [./examples/utility.examples.js](./examples/utility.examples.js#L93-L96)

Result:

```json
{
  "databases": [
    {
      "name": "fms-api-app"
    }
  ]
}
```

> File [./examples/results/databases-utility-example.json](./examples/results/databases-utility-example.json)

#### Product Info Utility

The productInfo utility will get Data API information for the server passed to it.

`productInfo(host, version, parameters)`

| Param        | Type                | Default                | Description                                            |
| ------------ | ------------------- | ---------------------- | ------------------------------------------------------ |
| host         | <code>String</code> |                        | The host FileMaker server.                             |
| [version]    | <code>String</code> | <code>"vLatest"</code> | The Data API version to use. The default is 'vLatest'. |
| [parameters] | <code>Object</code> |                        | Request configuration parameters.                      |

```js
const getProductInfo = client =>
  productInfo(client.server).then(result =>
    log('product-info-utility-example', result)
  );
```

> Excerpt from [./examples/utility.examples.js](./examples/utility.examples.js#L86-L89)

Result:

```json
{
  "name": "FileMaker Data API Engine",
  "buildDate": "03/27/2019",
  "version": "18.0.1.109",
  "dateFormat": "MM/dd/yyyy",
  "timeFormat": "HH:mm:ss",
  "timeStampFormat": "MM/dd/yyyy HH:mm:ss"
}
```

> File [./examples/results/product-info-utility-example.json](./examples/results/product-info-utility-example.json)

### Additional Client Capabilities

#### Data Merge

Both the create method and the edit method accept a merge boolean in their option parameters. If the `merge` property is true the data used to create or edit the filemaker record will be merged with the FileMaker Data API results.

```js
const mergeDataOnCreate = client =>
  client
    .create(
      'Heroes',
      {
        name: 'George Lucas'
      },
      { merge: true }
    )
    .then(result => log('create-record-merge-example', result));
```

> Excerpt from [./examples/create.examples.js](./examples/create.examples.js#L15-L24)

Result:

```json
{
  "name": "George Lucas",
  "recordId": "1138",
  "modId": "327"
}
```

> File [./examples/results/create-record-merge-example.json](./examples/results/create-record-merge-example.json)

#### Custom Request Agents

The client has the ability to create custom agents and modify requests parameters or use a proxy. Agents, request parameters, and proxies can be configured either when the client is created or when a request is being made.

A client can have a custom [Agent](https://nodejs.org/api/http.html#http_class_http_agent). Using a custom request agent will allow you to configure an agent designed for your specific needs. A request agent can be configured to not reject unauthorized request such as those with invalid SSLs, keep the connection alive, or limit the number of sockets to a host. There is no need to create an agent unless theses options are needed.

**Note** If you are using a custom agent you are responsible for destroying that agent with `client.destroy` once the agent is no longer used.

#### Custom Request Parameters

All client methods except `client.login()` and `client.logout()` accept request parameters. These parameters are `request.proxy` and `request.timeout`, `request.agent`. These properties will apply only to the current request.

#### Proxies

The client can be configured to use a proxy. The proxy can be configured either for every request by specifying the proxy during the creation of the client, or just for a particular request by specifying the proxy in the request parameters.

## Tests

```sh
npm install
npm test
```

```default
> fms-api-client@2.0.0 test /Development/fms-api-client
> nyc _mocha --recursive  ./test --timeout=15000 --exit



  Agent Configuration Capabilities
    ✓ should attempt to clear invalid sessions (147ms)
    ✓ should attempt to clear invalid sessions even if there is no header (94ms)
    ✓ should reject non http proticol requests (98ms)

  Agent Configuration Capabilities
    ✓ should accept no agent configuration
    ✓ should not create an agent unless one is defined (281ms)
    ✓ should adjust the request protocol according to the server
    ✓ should create an https agent
    ✓ should use a created request agent (192ms)
    ✓ should destory the agent when the client is deleted (280ms)
    ✓ should create an http agent
    ✓ should use a proxy if one is set (323ms)
    ✓ should require the http protocol (127ms)
    ✓ should accept a timeout property
    ✓ should use a timeout if one is set (116ms)

  Authentication Capabilities
    ✓ should authenticate into FileMaker. (86ms)
    ✓ should automatically request an authentication token (289ms)
    ✓ should reuse an open session (193ms)
    ✓ should log out of the filemaker. (170ms)
    ✓ should not attempt a logout if there is no valid token.
    ✓ should reject if the logout request fails (174ms)
    ✓ should reject if the authentication request fails (1425ms)
    ✓ should attempt to log out before being removed (94ms)
    ✓ should clear invalid sessions (1426ms)
    ✓ should catch the log out error before being removed if the login is not valid (373ms)

  ContainerData Capabilities
    ✓ should download container data from an object to a file (358ms)
    ✓ should download container data from an array to a file (1194ms)
    ✓ should return an array of records if it is passed an array (266ms)
    ✓ should return a single record object if passed an object (265ms)
    ✓ should download container data from an array to a buffer (287ms)
    ✓ should download container data from an object to a buffer (263ms)
    ✓ should substitute a uuid if the record id can not be found in an object (251ms)
    ✓ should substitute a uuid if the record id can not be found in an array (270ms)
    ✓ should reject with an error and a message (195ms)
    ✓ should reject if WPE rejects the request (194ms)

  Create Capabilities
    ✓ should create FileMaker records without fieldData (285ms)
    ✓ should allow you to specify a timeout (39ms)
    ✓ should create FileMaker records using fieldData (112ms)
    ✓ should create FileMaker records with portalData (116ms)
    ✓ should allow portalData to be an object or number (115ms)
    ✓ should reject bad data with an error (111ms)
    ✓ should create records with mixed types (118ms)
    ✓ should substitute an empty object if data is not provided (122ms)
    ✓ should return an object with merged data properties (118ms)
    ✓ should allow you to run a script when creating a record with a merge response (137ms)
    ✓ should allow you to specify scripts as an array (132ms)
    ✓ should allow you to specify scripts as an array with a merge response (139ms)
    ✓ should sanitize parameters when creating a new record (153ms)
    ✓ should accept both the default script parameters and a scripts array (128ms)

  Databases Capabilities
    ✓ should get hosted databases (79ms)
    ✓ should fail with a code and a message (115ms)

  Databases Utility Capabilities
    ✓ should retrieve databases without credentials (83ms)
    ✓ should retrieve databases using account credentials (82ms)
    ✓ should fail with a code and a message (233ms)
    ✓ should require a server to list databases

  Delete Capabilities
    ✓ should delete FileMaker records. (413ms)
    ✓ should allow you to specify a timeout (153ms)
    ✓ should trigger scripts via an array when deleting records. (242ms)
    ✓ should trigger scripts via parameters when deleting records. (241ms)
    ✓ should allow you to mix script parameters and scripts array when deleting records. (246ms)
    ✓ should stringify script parameters. (239ms)
    ✓ should reject deletions that do not specify a recordId (131ms)
    ✓ should reject deletions that do not specify an invalid recordId (123ms)

  Duplicate Record Capabilities
    ✓ should allow you to duplicate a record (447ms)
    ✓ should require an id to duplicate a record (254ms)

  Edit Capabilities
    ✓ should edit FileMaker records without fieldData (446ms)
    ✓ should allow you to specify a timeout (190ms)
    ✓ should edit FileMaker records using fieldData (263ms)
    ✓ should edit FileMaker records with portalData (273ms)
    ✓ should edit FileMaker records with portalData and allow portalData to be an array. (273ms)
    ✓ should reject bad data with an error (272ms)
    ✓ should return an object with merged filemaker and data properties (270ms)
    ✓ should allow you to run a script when editing a record (290ms)
    ✓ should allow you to run a script via a scripts array when editing a record (315ms)
    ✓ should allow you to specify scripts as an array (282ms)
    ✓ should allow you to specify scripts as an array with a merge response (290ms)
    ✓ should sanitize parameters when creating a editing record (304ms)
    ✓ should accept both the default script parameters and a scripts array (290ms)

  FieldData Capabilities
    ✓ it should extract field data while maintaining the array (486ms)
    ✓ it should extract field data while maintaining the object (287ms)

  Find Capabilities
    ✓ should perform a find request (536ms)
    ✓ should allow you to use an object instead of an array for a find (322ms)
    ✓ should specify omit Criterea (246ms)
    ✓ should safely parse omit true and false (213ms)
    ✓ should allow additional parameters to manipulate the results (151ms)
    ✓ should allow you to limit the number of portal records to return (163ms)
    ✓ should allow you to use numbers in the find query parameters (147ms)
    ✓ should allow you to sort the results (2077ms)
    ✓ should return an empty array if the find does not return results (162ms)
    ✓ should allow you run a pre request script (156ms)
    ✓ should return a response even if a script fails (161ms)
    ✓ should allow you to send a parameter to the pre request script (160ms)
    ✓ should allow you run script after the find and before the sort (886ms)
    ✓ should allow you to pass a parameter to a script after the find and before the sort (826ms)
    ✓ should reject of there is an issue with the find request (148ms)

  Get Capabilities
    ✓ should get specific FileMaker records. (500ms)
    ✓ should allow you to specify a timeout (231ms)
    ✓ should reject get requests that do not specify a recordId (355ms)
    ✓ should allow you to limit the number of portal records to return (316ms)
    ✓ should accept namespaced portal limit and offset parameters (318ms)

  Global Capabilities
    ✓ should allow you to set session globals (342ms)
    ✓ should allow you to specify a timeout (92ms)
    ✓ should reject with a message and code if it fails to set a global (159ms)

  Request Interceptor Capabilities
    ✓ should reject if the server errors (106ms)
    ✓ should intercept authentication errors (114ms)
    ✓ should reject non http requests to the server with a json error
    ✓ should reject non https requests to the server with a json error (138ms)
    ✓ should convert non json responses to json

  Layout Metadata Capabilities
    ✓ should get field and portal metadata for a layout (346ms)
    ✓ should require a layout (163ms)
    ✓ should fail with a code and a message (166ms)

  Database Layout List Capabilities
    ✓ should get a list of Layouts and folders for the currently configured database (353ms)
    ✓ should fail with a code and a message (187ms)

  List Capabilities
    ✓ should allow you to list records (436ms)
    ✓ should allow you to specify a timeout (97ms)
    ✓ should allow you use parameters to modify the list response (168ms)
    ✓ should should allow you to use numbers in parameters (164ms)
    ✓ should should allow you to provide an array of portals in parameters (166ms)
    ✓ should should remove non used properties from a portal object (177ms)
    ✓ should modify requests to comply with DAPI name reservations (164ms)
    ✓ should allow strings while complying with DAPI name reservations (173ms)
    ✓ should allow you to offset the list response (170ms)
    ✓ should santize parameters that would cause unexpected parameters (171ms)
    ✓ should allow you to limit the number of portal records to return (168ms)
    ✓ should accept namespaced portal limit and offset parameters (171ms)
    ✓ should reject invalid parameters (170ms)

  Client Product Info Capabilities
    ✓ should get FileMaker Server Information (76ms)
    ✓ should fail with a code and a message (123ms)

  Product Info Utility Capabilities
    ✓ should get FileMaker Server Information (88ms)
    ✓ should fail with a code and a message (222ms)
    ✓ should require a server parameter

  Request Queue Capabilities
    ✓ should queue requests to FileMaker (5449ms)

  RecordId Capabilities
    ✓ it should extract the recordId while maintaining the array (572ms)
    ✓ it should extract recordId while maintaining the object (358ms)

  Script Queue Capabilities
    ✓ should allow you to trigger a script with an object (373ms)
    ✓ should allow you to trigger a script with an object (193ms)
    ✓ should allow you to trigger a script with an array (192ms)
    ✓ should allow you to trigger a script via a string (191ms)
    ✓ should allow you to specify a timeout (121ms)
    ✓ should allow you to trigger a script without specifying a parameter (294ms)
    ✓ should allow you to trigger a script specifying a string as a parameter (200ms)
    ✓ should allow you to trigger a script specifying a number as a parameter (199ms)
    ✓ should allow you to trigger a script specifying an object as a parameter (189ms)
    ✓ should reject a script that does not exist (191ms)
    ✓ should allow return a result even if a script returns an error (201ms)
    ✓ should parse script results if the results are json (188ms)
    ✓ should not parse script results if the results are not json (197ms)

  Single Script Capabilities
    ✓ should allow you to trigger a script (392ms)
    ✓ should allow you to specify a timeout (126ms)
    ✓ should allow you to trigger a script specifying a string as a parameter (201ms)
    ✓ should allow you to trigger a script specifying a number as a parameter (199ms)
    ✓ should allow you to trigger a script specifying an object as a parameter (203ms)
    ✓ should allow you to trigger a script specifying an array as a parameter (207ms)
    ✓ should allow you to trigger a script without a parameter (204ms)
    ✓ should reject a script that does not exist (200ms)
    ✓ should parse script results if the results are json (199ms)
    ✓ should not parse script results if the results are not json (199ms)

  General Script Capabilities
    ✓ should allow you to trigger a script in a find (488ms)
    ✓ should allow you to trigger a script in a list (200ms)
    ✓ should reject a script that does not exist (189ms)
    ✓ should allow return a result even if a script returns an error (219ms)
    ✓ should parse script results if the results are json (204ms)
    ✓ should not parse script results if the results are not json (210ms)
    ✓ should parse an array of scripts (198ms)
    ✓ should trigger scripts on all three script phases (217ms)

  Database Script List Capabilities
    ✓ should get a list of scripts and folders for the currently configured database (390ms)
    ✓ should fail with a code and a message (234ms)

  Storage
    ✓ should allow an instance to be created
    ✓ should allow an instance to be saved.
    ✓ should reject if a client can not be validated
    ✓ should allow an instance to be recalled
    ✓ should allow instances to be listed
    ✓ should allow you to remove an instance

  Transform Capabilities
    ✓ should merge portal data and field data from an array (567ms)
    ✓ should merge portal data and field data from an object (286ms)
    ✓ should optionally not convert table::field keys from an array (290ms)
    ✓ should optionally not convert table::field keys from an object (279ms)
    ✓ should allow you to remove field data from an array (284ms)
    ✓ should allow you to remove field data from an object (294ms)
    ✓ should allow you to remove portal data from an array (283ms)
    ✓ should allow you to remove portal data from an object (291ms)
    ✓ should merge portal data and portal data from an array (292ms)

  File Upload Capabilities
    ✓ should allow you to specify a timeout (552ms)
    ✓ should allow you to upload a file to a new record (540ms)
    ✓ should allow you to upload a buffer to a new record (754ms)
    ✓ should allow you to upload a file to a specific container repetition (523ms)
    ✓ should allow you to upload a buffer to a specific container repetition (531ms)
    ✓ should reject with a message if it can not find the file to upload
    ✓ should allow you to upload a file to a specific record (646ms)
    ✓ should allow you to upload a buffer object to a specific record (526ms)
    ✓ should allow you to upload a file to a specific record container repetition (514ms)
    ✓ should allow you to upload a buffer to a specific record container repetition (514ms)
    ✓ should reject of the request is invalid (513ms)
    ✓ should reject an empty buffer object (225ms)
    ✓ should reject a null buffer object (222ms)
    ✓ should reject a number instead of an object (234ms)
    ✓ should reject an object without a filename (219ms)
    ✓ should reject an object without a buffer (233ms)

  Data API URL Construction Capabilities
    Get URL Construction
      ✓ should generate a get request url
      ✓ should not require a version
    Update URL Construction
      ✓ should generate a record update url (422ms)
      ✓ should not require a version (228ms)
    Delete URL Construction
      ✓ should generate a record delete url (234ms)
      ✓ should not require a version (237ms)
    Get URL Construction
      ✓ should generate a get record url (234ms)
      ✓ should not require a version (238ms)
    List URL Construction
      ✓ should generate a list records url
      ✓ should not require a version
    Find URL Construction
      ✓ should generate a find url
      ✓ should not require a version
    Logout URL Construction
      ✓ should generate a logout url
      ✓ should not require a version
    Globals URL Construction
      ✓ should generate a global url
      ✓ should not require a version
    Logout URL Construction
      ✓ should generate a logout url
      ✓ should not require a version
    Upload URL Construction
      ✓ should generate a upload url
      ✓ should not require a repetition
      ✓ should not require a version
    Authentication URL Construction
      ✓ should generate a authentication url
      ✓ should not require a version
    Database Layouts Metadata URL Construction
      ✓ should generate a database layouts metadata url
      ✓ should not require a version
    Layout Metadata URL Construction
      ✓ should generate a layout metadata url
      ✓ should not require a version
    Database Scripts Metadata URL Construction
      ✓ should generate a database scripts metadata url
      ✓ should not require a version
    Duplicate Record URL Construction
      ✓ should generate a duplicate record url
      ✓ should not require a version
    Product Info URL Construction
      ✓ should generate a product Info metadata url
      ✓ should not require a version
    Server Databases Metadata URL Construction
      ✓ should generate a server databases metadata url
      ✓ should not require a version
    Run a Script URL Construction
      ✓ should generate a server databases metadata url
      ✓ should not require a version

  Data Usage
    Tracks Data Usage
      ✓ should track API usage data. (425ms)
      ✓ should allow you to reset usage data. (234ms)
    Does Not Track Data Usage
      ✓ should not track data usage in (407ms)
      ✓ should not track data usage out (234ms)

  Conversion Utility Capabilities
    Omit Utility
      ✓ it should remove properties while maintaing the array
      ✓ it should remove properties while maintaing the object
    Parse Utility
      ✓ it should return a string when given a string
      ✓ it should return an object when given a stringified object
    isJSON Utility
      ✓ it should return true for an object
      ✓ it should return true for an empty object
      ✓ it should return true for a stringified object
      ✓ it should return false for a number
      ✓ it should return false for undefined
      ✓ it should return false for a string
      ✓ it should return false for null

  Filemaker Utility Capabilities
    filter Results
      ✓ it should pick an array of properties while maintaing the array
      ✓ it should pick an array of properties while maintaing the object
      ✓ it should pick a string property while maintaing the array
      ✓ it should pick a string property while maintaing the object


  253 passing (1m)

------------------------------|----------|----------|----------|----------|-------------------|
File                          |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
------------------------------|----------|----------|----------|----------|-------------------|
All files                     |      100 |      100 |      100 |      100 |                   |
 fms-api-client               |      100 |      100 |      100 |      100 |                   |
  index.js                    |      100 |      100 |      100 |      100 |                   |
 fms-api-client/src           |      100 |      100 |      100 |      100 |                   |
  index.js                    |      100 |      100 |      100 |      100 |                   |
 fms-api-client/src/models    |      100 |      100 |      100 |      100 |                   |
  agent.model.js              |      100 |      100 |      100 |      100 |                   |
  client.model.js             |      100 |      100 |      100 |      100 |                   |
  connection.model.js         |      100 |      100 |      100 |      100 |                   |
  credentials.model.js        |      100 |      100 |      100 |      100 |                   |
  data.model.js               |      100 |      100 |      100 |      100 |                   |
  index.js                    |      100 |      100 |      100 |      100 |                   |
  session.model.js            |      100 |      100 |      100 |      100 |                   |
 fms-api-client/src/services  |      100 |      100 |      100 |      100 |                   |
  container.service.js        |      100 |      100 |      100 |      100 |                   |
  index.js                    |      100 |      100 |      100 |      100 |                   |
  metadata.service.js         |      100 |      100 |      100 |      100 |                   |
  request.service.js          |      100 |      100 |      100 |      100 |                   |
  transform.service.js        |      100 |      100 |      100 |      100 |                   |
 fms-api-client/src/utilities |      100 |      100 |      100 |      100 |                   |
  conversion.utilities.js     |      100 |      100 |      100 |      100 |                   |
  filemaker.utilities.js      |      100 |      100 |      100 |      100 |                   |
  index.js                    |      100 |      100 |      100 |      100 |                   |
  urls.utilities.js           |      100 |      100 |      100 |      100 |                   |
------------------------------|----------|----------|----------|----------|-------------------|
```

## Dependencies

- [axios](https://github.com/axios/axios): Promise based HTTP client for the browser and node.js
- [axios-cookiejar-support](https://github.com/3846masa/axios-cookiejar-support): Add tough-cookie support to axios.
- [form-data](https://github.com/form-data/form-data): A library to create readable "multipart/form-data" streams. Can be used to submit forms and file uploads to other web applications.
- [into-stream](https://github.com/sindresorhus/into-stream): Convert a string/promise/array/iterable/buffer/typedarray/arraybuffer/object into a stream
- [lodash](https://github.com/lodash/lodash): Lodash modular utilities.
- [marpat](https://github.com/luidog/marpat): A class-based ES6 ODM for Mongo-like databases.
- [mime-types](https://github.com/jshttp/mime-types): The ultimate javascript content-type utility.
- [moment](https://github.com/moment/moment): Parse, validate, manipulate, and display dates
- [object-sizeof](https://github.com/miktam/sizeof): Sizeof of a JavaScript object in Bytes
- [prettysize](https://github.com/davglass/prettysize): Convert bytes to other sizes for prettier logging
- [stream-to-array](https://github.com/stream-utils/stream-to-array): Concatenate a readable stream's data into a single array
- [tough-cookie](https://github.com/salesforce/tough-cookie): RFC6265 Cookies and Cookie Jar for node.js
- [uuid](https://github.com/kelektiv/node-uuid): RFC4122 (v1, v4, and v5) UUIDs

## Development Dependencies

- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [chai-as-promised](https://github.com/domenic/chai-as-promised): Extends Chai with assertions about promises.
- [coveralls](https://github.com/nickmerwin/node-coveralls): takes json-cov output into stdin and POSTs to coveralls.io
- [deep-map](https://github.com/mcmath/deep-map): Transforms nested values of complex objects
- [dotenv](https://github.com/motdotla/dotenv): Loads environment variables from .env file
- [eslint](https://github.com/eslint/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-google](https://github.com/google/eslint-config-google): ESLint shareable config for the Google style
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier): Turns off all rules that are unnecessary or might conflict with Prettier.
- [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier): Runs prettier as an eslint rule
- [fs-extra](https://github.com/jprichardson/node-fs-extra): fs-extra contains methods that aren't included in the vanilla Node.js fs package. Such as mkdir -p, cp -r, and rm -rf.
- [http-proxy](https://github.com/nodejitsu/node-http-proxy): HTTP proxying for the masses
- [jsdoc](https://github.com/jsdoc/jsdoc): An API documentation generator for JavaScript.
- [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown): Generates markdown API documentation from jsdoc annotated source code
- [minami](https://github.com/Nijikokun/minami): Clean and minimal JSDoc 3 Template / Theme
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mocha-lcov-reporter](https://github.com/StevenLooman/mocha-lcov-reporter): LCOV reporter for Mocha
- [mos](https://github.com/mosjs/mos): A pluggable module that injects content into your markdown files via hidden JavaScript snippets
- [mos-plugin-dependencies](https://github.com/mosjs/mos/tree/master/packages/mos-plugin-dependencies): A mos plugin that creates dependencies sections
- [mos-plugin-execute](https://github.com/team-767/mos-plugin-execute): Mos plugin to inline a process output
- [mos-plugin-installation](https://github.com/mosjs/mos/tree/master/packages/mos-plugin-installation): A mos plugin for creating installation section
- [mos-plugin-license](https://github.com/mosjs/mos-plugin-license): A mos plugin for generating a license section
- [mos-plugin-snippet](https://github.com/mosjs/mos/tree/master/packages/mos-plugin-snippet): A mos plugin for embedding snippets from files
- [nyc](https://github.com/istanbuljs/nyc): the Istanbul command line interface
- [prettier](https://github.com/prettier/prettier): Prettier is an opinionated code formatter
- [sinon](https://github.com/sinonjs/sinon): JavaScript test spies, stubs and mocks.
- [snyk](https://github.com/snyk/snyk): snyk library and cli utility
- [varium](https://npmjs.org/package/varium): A strict parser and validator of environment config variables
