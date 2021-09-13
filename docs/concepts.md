# Introduction

Usually integrating the network to a React application is a tedious task and requires manual labor to maintain the 
network integration layer. Mycoriza simplifies whole network integration overhead and allows you to focus on more
important problems than network integration. 

There are multiple concepts we believe in.

## Generates the Boilerplate

There are various tools and tactics used in developing the network layer of react applications. Most of those solutions
provides a library to use and conventions to follow. The other solutions provides the code generation as a solution. Mycoriza 
prefers code generation as it leverages the network integration burden. This vastly reduces the **knowledge
cost** of the library.

### Encourages Standardized API Integration.

Documenting an API is a best practice in API development. Yet, it requires the development time and effort to 
maintain the API documentation and often sees as an additional task outside the core developments. Mycoriza attempts
to change that opinion by offering the tradeoff of Client network API generation to Documentation.

[OpenAPI](https://swagger.io/specification/) is a widely used matured **toolset / specification** for 
API documentation. Mycoriza uses swagger 3+ API specification for boilerplate generation.

## Uses stable stack.

The libraries like `redux` and `axios` have already mastered there usecase well. Mycoriza reuses these specializations
and builds upon them. Under the hood, Mycoriza uses `redux` for state management and `axios` for the rest API 
integration.

## Simple and Expressive

_Simple code provides fewer defects and pleasant development experience._   

React provides its own convention of doing things. Mycoriza makes use of these conventions to provide more simple 
and natural react development experience.

### Uses more simplified and standard `hook` API, which is more natural to the react.

Every generated hook follows similar syntax much similar to the `useState` hook.

```jsx
const [state, fetchOrUpdate, clear] = useGenertedMethod(/*entityKey*/);
```

### Favors `States` to `Promises`

In javascript, promise represents a possibility and the time aspect is embedded to the promise itself. Using the 
promises in react components is confusing and often leads to bugs. In API response handling, Mycoriza 
follows more natural approach than promises. 

Mycoriza converts the promises to states (a.k.a. NetworkState). These generated states follows a predefined 
and predictable lifecycle. You can write your components to respond to each state and upon NetworkState change 
the component re-renders with the correct state.

## Type safe.

Mycoriza is written with strong type safety in mind. It supports `typescript:4+` and makes use of the features like
`type guards` to provide better type safety.  

## Well documented.

Often times, you may not have the complete understanding of the API you are dealing with. You may need to spend
more time on learning the API than developing the application. To reduce this knowledge gap, Mycoriza generates a 
comprehensive API documentation alongside the api generation. The documentation is organized based on the category 
and provides the necessary descriptions and examples alongside the generated hooks.

## Performant

Mycoriza generates the hooks and reducers separately. Hence, Mycoriza does not affect the current optimization practices like 
code splitting

