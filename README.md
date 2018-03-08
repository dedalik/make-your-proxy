### make-your-proxy
**make-your-proxy** is a simple proxy which can be extended with a set of plugins
### Configuration
**myproxy.config.json** is used for proxy configuration.

Example:

```
{
	"target": "https://www.google.com/",
	"port": "8008",
	"plugins": [
		{
			"name": "console-to-terminal",
			"options": {
				"host": "localhost",
				"port": "8009"
			}
		}
	]
}
```
### Run
Use `yarn start` to launch proxy. Additional params could be passed to override configuration:

* `--target` or `-t` to set target. Example: `--target=https://www.google.com`
* `--port` or `-p` to set proxy port. Example: `--port=1234`
