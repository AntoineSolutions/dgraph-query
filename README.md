## Dgraph Query

### Introduction

The purpose of the classes within this module is to provide a mechanism to
create reusable queries and query components for dgraph. In addition, the
module aims to improve dx by providing type safe components instead of a text
interface.

### Reusing queries
Given the queries:

```
query getSinglePlumbus($plumbusId: string, $ownerId: string) {
  ownerAccess(func: uid($ownerId)) @filter(eq(alive, true)) {
    aliveOwner as uid
  }

  plumbus(func: uid($plumbusId)) @filter(eq(owner, aliveOwner)) {
    color
    knobbliness
    tailFatigue
  }
}
```
and
```
query getPlumbuses($ownerId: string) {
  ownerAccess(func: uid($ownerId)) @filter(eq(alive, true)) {
    aliveOwner as uid
  }

  plumbus(func: type("Plumbus") @filter(eq(owner, aliveOwner)) {
    color
    knobbliness
    tailFatigue
  }
}
```

the owner access query block is completely rewritten.

This module allows a developer to compose the ownerAccess query ahead of
time:
```
const userId = "0x12"; 
const ownerAccessQuery = new Query("ownerAccess")
  .setCondition({func: "uid", value: new QueryArg("string", userId, "ownerId"))
  .setFilters(new FilterGroup()
    .addFilter(new Filter()
      .setArg("bool", true, "isAlive")
    )
  )
  .addFields(["uid"]);
```
This query can be used as is, or can be used in other queries.
```
const myPlumbusQuery = new Query("plumbus")
  .setCondition({func: "uid", value: new QueryArgs("string", plumbusId, "plumbusId"))
  .setFilter(new FilterGroup()
    .addFilter(new Filter()
      .setValueVariable("isAlive")
    )
  )
  .addQueryBlock(ownerAccessQuery) // Here it is!
  .addFields(["color", "knobbliness", "tailFatigue"]);
```

### Altering queries.
Each part of a query is editable throughout the entire process of building
the query. The components each are given an id on creation that they maintain
until the object is destoyed. Values are injected through the QueryArgs object
that automatically replaces the value with a placeholder.
