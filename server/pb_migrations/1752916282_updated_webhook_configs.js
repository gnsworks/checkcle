/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_45665081")

  // remove field
  collection.fields.removeById("select4246785570")

  // add field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1579384326",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1582905952",
    "max": 0,
    "min": 0,
    "name": "method",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1414600993",
    "max": 0,
    "min": 0,
    "name": "payload_template",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2168550802",
    "max": 0,
    "min": 0,
    "name": "trigger_events",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_45665081")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select4246785570",
    "maxSelect": 1,
    "name": "event_filters",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "down",
      "up",
      "ssl_expired",
      "warning",
      "ssl_ok",
      "high_cpu",
      "high_memory",
      "agent_offline",
      "custom_alert"
    ]
  }))

  // remove field
  collection.fields.removeById("text1579384326")

  // remove field
  collection.fields.removeById("text1582905952")

  // remove field
  collection.fields.removeById("text1414600993")

  // update field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2168550802",
    "max": 0,
    "min": 0,
    "name": "timeout",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
