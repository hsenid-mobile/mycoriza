import {OpenAPIV3} from "openapi-types";

export function filterByRegex(regex: string, openApi: OpenAPIV3.Document<any>): OpenAPIV3.Document<any> {
    let paths = openApi.paths;
    let filteredPaths = {};
    for (let path in paths) {
        if (path.match(regex)) {
            filteredPaths[path] = paths[path];
        }
    }

    function recurse(obj: any, components: OpenAPIV3.ComponentsObject) {

        function recursivelyAdd(path: string[], source: any, target: any) {
            let [key, ...rest] = path;
            if (rest.length === 0) {
                target[key] = source[key];
            } else {
                if (!target[key]) {
                    target[key] = {};
                }
                recursivelyAdd(rest, source[key], target[key]);
            }
        }

        for (let key in obj) {
            if (key === '$ref') {
                let ref = obj[key].replace('#/components/', '').split('/');
                recursivelyAdd(ref, openApi.components, components);
            }
            if (typeof obj[key] === 'object') {
                recurse(obj[key], components);
            }
        }
    }

    let components = {};
    recurse(filteredPaths, components);

    return {
        ...openApi,
        paths: filteredPaths
    };
}
