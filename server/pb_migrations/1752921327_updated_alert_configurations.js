/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1938176441")

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "select1358543748",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "disabled",
      "enabled"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1938176441")

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "select1358543748",
    "maxSelect": 1,
    "name": "enabled",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "true",
      "false"
    ]
  }))

  return app.save(collection)
})
