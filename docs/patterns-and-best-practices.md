
# Patterns and Best Practices.

Throughout our usage of this framework, we have identified several patterns which can be used with the networks state.

## Conditional returns based on the state.

You can explicitly return the content based on the state. This allows more control over the component rendering as each
content to be returned is explicit.

```jsx
import {isError, isPending, isSuccess} from "mycoriza-runtime";

function MyComponent() {
    const [state] = useYoutGeneratedHook()

    if (isInit(state)) {
        return <InitContent/>
    }
    
    if (isPending(state)) {
        return <Loading/>
    }

    if (isError(state)) {
        return <ErrorContent error={state.error}/>
    }
    
    return <SuccessContent data={state.data} />;
}
```

## Conditional rendering within jsx.

In cases where only one of the states makes sense, it can be used as follows. In here `isSuccess()` acts as a boolean 
result generator.

```jsx
import {isSuccess} from "mycoriza-runtime";

function MyComponent() {
    const [state] = useYoutGeneratedHook()
    
    return <div>
        {isSuccess(state) && <SuccessContent data={state.data}/>}
    </div>;
}
```

## Eager fetching.

In some cases the data should be fetched as soon as the component is loaded. We can use `useEffect` hook to emmulate this
functionality.

```jsx
import {isSuccess} from "mycoriza-runtime";
import {useEffect} from "react";

function MyComponent() {
    const [state, fetchData] = useYoutGeneratedHook()

    useEffect(() => {
        fetchData()
    }, [])

    return <div>
        {isSuccess(state) && <SuccessContent data={state.data}/>}
    </div>;
}
```

## Cleanup upon exit.

In some cases the stale data may affect the future of the application flow. For an example stale product in a 
product page may result a flashy view of the stale product before loading the correct page. To prevent such situations, 
the cleanup function can be used to cleanup the state.

```jsx
import {isSuccess} from "mycoriza-runtime";
import {useEffect} from "react";

function MyComponent() {
    const [state, fetchData, clear] = useYoutGeneratedHook()
    
    //Execute fetchData whenever you need.
    
    useEffect(() => {
        return clear;
    }, [])

    return <div>
        {isSuccess(state) && <SuccessContent data={state.data}/>}
    </div>;
}
```

Upon component unload, above code will clear the relevant network state in the application.

## Hide intermediate pending state.

In some cases, showing a loader for intermediate data fetching is unnecessary. For an example
it is weird to see a loader while searching and filter a list in a list page. To handle such scenarios
the network state can be locally cached.

```jsx
import {isSuccess, isPending, isError} from "mycoriza-runtime";
import {useEffect} from "react";

function MyComponent() {
    const [networkState, fetchData, clear] = useYoutGeneratedHook()
    const [state, setState] = useState<NetworkState<unknown>>(networkState)

    //Execute fetchData whenever you need.

    useEffect(() => {
        if (!isPending(networkState)) {
            setState(networkState)
        }
    }, [networkState]);

    return <div>
        {isSuccess(state) && <SuccessContent data={state.data}/>}
        {isError(state) && <Error error={state.error}/>}
    </div>;
}
```

## Prefer hook for each necessary component over pass-through-props.

As the network state adds additional wrapper over original data, naturally developers tend to unwrap the state 
and pass through the props. This leads component coupling. If you feel like your component is an **independent component**,
do not pass the content as props.

- Following code is too coupled (Bad)

```jsx 
import {isSuccess} from "mycoriza-runtime";

interface ComponentAProps {
    data: any
}

//This component contains a dependency and coupled with ComponentB.
function ComponentA({data}: ComponentAProps) {
    return <>{JSON.stringify(data)}</>
}

function ComponentB() {
    const [state] = useYoutGeneratedHook()
    return <>
        {isSuccess(state) && <ComponentA data={state.data}/> }
        </>
    }
```

- Following components are independent.
```jsx
import {isSuccess} from "mycoriza-runtime";

//This component is independent and can be used anyware it is needed.
function ComponentA() {
    const [state] = useYoutGeneratedHook()
    return <>{isSuccess(state) && JSON.stringify(data)}</>
}

function ComponentB() {
    const [state] = useYoutGeneratedHook()
    return <>
        {isSuccess(state) && <ComponentA/> }
        </>
    }
```

However, if you are developing a component which is not exposed outside the module and does not have any intention of
reusing, first code is good.

## Use `entityKey` to load multiple results for same api.

In some cases we need to keep different results for the same API call simultaneously. Mycoriza provides the inbuilt 
support for this. In the generated hooks, first parameter is an entity key, by adding a unique entity key, you can keep
different results at the same time.

```jsx
import {isSuccess} from "mycoriza-runtime";
import {useEffect} from "react";

function MyComponent() {
    const [product1State, fetchProduct1] = useFetchProduct("product-id-1")
    const [product2State, fetchProduct2] = useFetchProduct("product-id-2")

    useEffect(() => {
        fetchProduct1({id: "product-id-1"})
        fetchProduct2({id: "product-id-2"})
    }, [])

    return <div>
        {isSuccess(product1State) && <ProductView data={product1State.data}/>}
        {isSuccess(product2State) && <ProductView data={product2State.data}/>}
    </div>;
}
```
