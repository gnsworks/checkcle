/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {

  try {
    const collection = app.findCollectionByNameOrId("pbc_3414192583");
    return app.delete(collection);
  } catch (e) {
    console.warn("Skip delete (server_notifications):", e?.message);
  }
}, (app) => {
  try {
    const collection = new Collection({
      "createRule": "",
      "deleteRule": "",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text407168695",
          "max": 0,
          "min": 0,
          "name": "server_id",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text3065852031",
          "max": 0,
          "min": 0,
          "name": "message",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text887233555",
          "max": 0,
          "min": 0,
          "name": "notification_type",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "date3805952114",
          "max": "",
          "min": "",
          "name": "read_at",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "date"
        },
        {
          "hidden": false,
          "id": "number1377725610",
          "max": null,
          "min": null,
          "name": "cpu_threshold",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number3087505384",
          "max": null,
          "min": null,
          "name": "ram_threshold",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number2833320134",
          "max": null,
          "min": null,
          "name": "disk_threshold",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number1826572927",
          "max": null,
          "min": null,
          "name": "network_threshold",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number2184331740",
          "max": null,
          "min": null,
          "name": "notification_config_id",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "id": "pbc_3414192583",
      "indexes": [],
      "listRule": "",
      "name": "server_notifications",
      "system": false,
      "type": "base",
      "updateRule": "",
      "viewRule": ""
    });

    return app.save(collection);
  } catch (e) {
    console.warn("Skip rollback (server_notifications):", e?.message);
  }
});
