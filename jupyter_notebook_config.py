c = get_config()
c.NotebookApp.nbserver_extensions = {
    'qoffeeapi': True,
}
c.NotebookApp.port = 8889