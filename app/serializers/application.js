import RESTSerializer from "@ember-data/serializer/rest"
import { v4 } from "ember-uuid"
import { isPresent } from "@ember/utils"

export default RESTSerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id)  {
    const normalizedResponse = {
      data: {
        type: "word",
        id: id,
        attributes: {
          frequency: payload.frequency,
          syllables: payload.syllables ? payload.syllables.list : [payload.word],
          pronunciation: payload.pronunciation,
        },
        relationships: {
          definitions: {
            data: [],
          },
        },
      },
      included: [],
    }

    if (payload.results) {
      // payload.results is a list of definitions for the word.
      payload.results.forEach((d) => {
        // add each definition to the word's relationships
        if (isPresent(d.partOfSpeech)) {
          const uuid = v4() // generate a uuid for this definition

          const definition = {
            type: "definition",
            id: uuid,
            attributes: d,
          }

          // add definition id to the relationships array
          normalizedResponse.data.relationships.definitions.data.push({
            type: "definition",
            id: uuid,
          })

          // add definition object to included array so it gets loaded into ember-data
          normalizedResponse.included.push(definition)
        }
      })
    }

    return normalizedResponse
  },
})
