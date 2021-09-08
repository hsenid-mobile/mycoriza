# A word about `NetworkState`

By nature, the network calls are asynchronous. Therefore, in most HTTP clients, the network call
results are modeled after the promises. The promises work well with javascript, yet in react 
components, promises makes confusions. Mycoriza prefer states to promise, as handling state is more natural.

Mycoriza introduces a new generic type `NetworkState<T>`. It follows predefined state flow as follows.

