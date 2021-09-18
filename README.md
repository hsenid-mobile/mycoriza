> _**Mycorrhizae** are a **symbiotic association between plant roots and fungi**.
 Their major role is to enhance nutrient and water uptake by the host plant
 by exploiting a larger volume of soil than roots alone can do. Mycorrhizae
 come in a number of forms, dependent upon both host plant and fungal taxonomy._
>
> -- <cite>J. Dighton, in Encyclopedia of Microbiology (Third Edition), 2009</cite>

# Mycoriza ![React](https://img.shields.io/badge/react-16.8%2B-blue) ![Typescript](https://img.shields.io/badge/typescript-4.4%2B-blue) ![Swagger](https://img.shields.io/badge/swagger-3%2B-blue)

Mycoriza is a `typescript library / code generator` for integrating _Rest API_ to react applications.

* **Painless**: Mycoriza makes the Rest API integration ridiculously easy by providing a toolset to generate more 
react-ish, _well documented_ network layer boilerplate. This helps the developers to spend there valuable time on more important problems 
than network integration. 

* **Explicit**: In react applications, classic way of handling the asynchronous behavior is often confusing and requires more 
effort in maintaining. Mycoriza incorporates more explicit approach by modeling the promises as states, and provides
the necessary tools to mine information in typesafe manner.

* **Safe**: Mycoriza ensures the type-safety through strong `typescript` support and integration-safety through easy 
and typesafe API client generation.

## Getting Started

A new Mycoriza project can be created easily using `create-react-app`.

```shell
npx create-react-app <project-name> --template mycoriza
```

To generate the network layer, go to project directory and run following command.

```shell
cd <project-name> & npm run updateApi
```

Necessary configurations will be requested during the first code generation. 

## Guides

To learn more, please refer [documentation and guides](https://hsenid-mobile.github.io/mycoriza/)
