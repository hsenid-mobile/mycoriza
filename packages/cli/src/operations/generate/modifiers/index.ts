import {OpenApiSpecModifier} from "./types";
import {extractInlineResponse} from "./extractInlineResponse";
import {extractInlineRequestBody} from "./extractInlineRequestBody";

const modifiersList: OpenApiSpecModifier[] = [
  extractInlineResponse,
  extractInlineRequestBody
]

export function combinedModifiers(...modifiersList: OpenApiSpecModifier[]): OpenApiSpecModifier {
  return context => {
    let operators = modifiersList.map(m => m(context));
    return doc => {
      let result = doc
      for (let operator of operators) {
        result = operator(result)
      }
      return result
    };
  }
}
