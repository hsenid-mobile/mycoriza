# A word about `NetworkState`

By nature, the network calls are asynchronous. Therefore, in most HTTP clients, the network call
results are modeled after the promises. The promises work well with javascript, yet in react 
components, promises makes confusions. Mycoriza prefer states to promise, as handling state is more natural.

## Network State
Mycoriza introduces a new generic type `NetworkState<T>`. It follows predefined state flow as follows.

```text
                 ┌──────┐
   ┌─────────────► Init ◄────────────┐
   │             └▲────┬┘            │
   │              │    │             │
   │           Reset  Execute        │
 Reset            │    │           Reset
   │           ┌──┴────┴──┐          │
   │      ┌────► Pending  ◄────┐     │
   │      │    └──┬────┬──┘    │     │
   │   Execute    │    │    Execute  │
   │      │       │    │       │     │
   │      │ OnSuccess OnError  │     │
   │ ┌────┴──┐    │    │    ┌──┴───┐ │
   └─┤Success◄────┘    └────►Error ├─┘
     └───────┘              └──────┘   
```

* **Init**: This state means that the network call is not yet initiated. 
* **Pending**: Upon initiating the call, the `NetworkState` moves to `Pending` state. Loaders can be rendered within this state
* **Success**: `NetworkState` moves to this state upon a successful completion of the network call. This state contains a
a property called `data` which contains the result of the execution.
* **Error**: `NetworkState` moves to this state upon a failure of the network call. This state contains the metadata about 
the failure of the network call.

## Typesafe Utilities

Some of those utility functions contains additional information related to the operation. To mine out this information,
Mycoriza provides a set of utility functions as follows

### `isInit(<state>)`

This function checks whether the NetworkState is in init state. Usage can be listed as follows.

```typescript jsx
function MyComponent() {
    const [state] = useYoutGeneratedHook()

    if (isInit(state)) {
        return <InitStateContent/>
    }
    
    return null;
}
```

### `isPending(<state>)`

This function checks whether the NetworkState is in pending state. Usually the loaders can be rendered in this state.

```typescript jsx
function MyComponent() {
    const [state] = useYoutGeneratedHook()

    if (isPending(state)) {
        return <Loader/>
    }

    return null;
}
```

### `isSuccess(<state>)`

This function check whether the NetworkState is in success state. This state contains the result in the `data` property.
the data property is accessible only where the 
It can be used as follows.

```typescript jsx
function MyComponent() {
    const [state] = useYoutGeneratedHook()
    
    // Following code fails as state is not confirmed to be in Success state.
    console.log(state.data)
    if (isSuccess(state)) {
        return <SuccessContent/>
    }

    return null;
}
```

### `isError(<state>)`

This function check whether the NetworkState is in success state. This state contains the error in the `error` property.
It can be used as follows.

```typescript jsx
function MyComponent() {
    const [state] = useYoutGeneratedHook()

    if (isError(state)) {
        return <Error/>
    }

    return null;
}
```
