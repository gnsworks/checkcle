/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1938176441")

  // add field
  collection.fields.addAt(20, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1654359675",
    "max": 0,
    "min": 0,
    "name": "ntfy_endpoint",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select887233555",
    "maxSelect": 1,
    "name": "notification_type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "telegram",
      "signal",
      "discord",
      "slack",
      "webhook",
      "google_chat",
      "email",
      "ntfy"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1938176441")

  // remove field
  collection.fields.removeById("text1654359675")

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select887233555",
    "maxSelect": 1,
    "name": "notification_type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "telegram",
      "signal",
      "discord",
      "slack",
      "webhook",
      "google_chat",
      "email"
    ]
  }))

  return app.save(collection)
})
