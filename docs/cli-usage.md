# Mycoriza CLI.

Mycoriza provides a CLI to generate to the boilerplate and collect necessary configurations. The `updateApi` task 
generated by the `Mycoriza cra template` uses the CLI under the hood.

The CLI currently contains following commands.

## Usage

It is advised to run the mycoriza commands with `npx`.

!!! warning
    Mycoriza tool can be added as a project dev dependency and execute through yarn. However,
    due to a limitation of yarn, the command may not complete.

```shell
$ npx mycoriza [command]
```

Following commands are available within the tool.

| Command         | Behavior       | Description                                  |
|-----------------|----------------|----------------------------------------------|
| `add`           | interactive    | Add swagger source to mycoriza configuration |
| `rm`            | interactive    | Remove swagger source.                       |
| `ls`            | single command | List current mycoriza sources.               |
| `generate:api`  | single command | Generates the client types and hooks.        |

### Manage Sources

#### Add swagger source.
=== "Interactive"

    ``` shell
    $ npx mycoriza add
    ```

=== "Single Command"

    ```shell
    $ npx mycoriza add -s <swagger-source-url> -d <dev-url> -p <prod-url> --id <source-id>
    ```


This is an interactive command and during the operation following information are collected.

| Option                    | CLI Option             | Descriptino                                                                                                               |
|---------------------------|------------------------|---------------------------------------------------------------------------------------------------------------------------|
| Swagger Specification URL | `--source` <br/>`-s`   | Specification URL for the swagger documentation.                                                                          |
| Development Base URL      | `--dev-url` <br/>`-d`  | Base url to connect during the development.                                                                               |
| Production Base URL       | `--prod-url` <br/>`-p` | Base url to connect during the production.                                                                                |
| id                        | `--id`                 | ID of the source. <br/>This id will be used as the directory of the generated source <br/>and therefore camalcase value is required |

!!! Note
    The generated configuration is saved in `mycoriza.config.json`. in the root of the project directory.

#### List swagger sources.
```shell
$ npx mycoriza ls
```

This command will list down all the mycoriza configurations already configured in the project.

#### Remove swagger sources.
=== "Interactive"
    ```shell
    $ npx mycoriza rm
    ```
=== "Single Command"
    ```shell
    $ npx mycoriza rm <source-id>
    ```

This command will prompt a selection to remove specific swagger source from the configuration. 
!!! Note
    Please consider that the `npx mycoriza rm` does not remove the existing generated sources.

This is an interactive command and during the operation following information are collected

| Option | CLI Option | Description                    |
|--------|------------|--------------------------------|
| Source | `[id]`     | ID of the source to be removed |

!!! Warning
    All the mycoriza configurations are saved in `mycoriza.config.json`. Even though, it is tempting to update the
    sources of the file directly, it is advised to use the mycoriza cli tool, is it provides additional validations
    over the configurations.

### Generate APIs

Use following command to generate the API hooks.

```shell
$ npx mycoriza generate:api [...sources]
```

| Option  | CLI Option    | Description                                                                                                           |
|---------|---------------|-----------------------------------------------------------------------------------------------------------------------|
| sources | `[...source]` | List of sources to be fetched. If the list is empty, the clients for <br/>all the configured sources are regenerated. |


This command will generate the source necessary sources for related to swagger documentations. The generated code
can be found in `src/api/<source-id>/` directory.
