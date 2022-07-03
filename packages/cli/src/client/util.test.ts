import {extractReturnType} from './util'
import {OpenAPIV3} from "openapi-types";

//openApi3 sample spec with one operation and one path and reference to a schema
const openApi3: OpenAPIV3.Document<any> = {
    openapi: '3.0.0',
    info: {
        title: 'My API',
        version: '1.0.0'
    },
    paths: {
        '/': {
            get: {
                operationId: 'get',
                responses: {
                    '200': {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/User'
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    components: {
        schemas: {
            User: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string'
                    },
                    age: {
                        type: 'integer'
                    }
                }
            }
        }
    }
}



//test extract return type for OpenAPI v3 return types
test('extractReturnType for OpenAPI v3 return types', () => {
    const operation: OpenAPIV3.OperationObject<any> = openApi3.paths['/']?.get;
    const typeRefs = extractReturnType(operation);
    console.log(operation, typeRefs);
    expect(typeRefs).toEqual([
        {
            type: 'object',
            properties: {
                name: {
                    type: 'string'
                },
                age: {
                    type: 'integer'
                }
            }
        }
    ]);
})
