import pyaml
import jinja2

with open("info.yaml") as f: 
    content = pyaml.yaml.safe_load(f)

def render(template_filename, out_filename, context):
    env = jinja2.Environment()
    
    with open(template_filename) as template_stream:
        template_str = template_stream.read()
    template = env.from_string(template_str)

    with open(out_filename, "wt") as f:
        f.write(template.render(context))

render("templates/index.html", "index.html", content)
render("templates/portfolio.html", "portfolio.html", content)