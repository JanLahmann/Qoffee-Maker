# Welcome to the Qoffee Maker

## Introduction
Qoffee Maker is based on [Quantum Computing](https://en.wikipedia.org/wiki/Quantum_computing) and will produce a coffee, capuccino, etc based on the measurement result of a Quantum Circuit. All you need to do to get your favourite type of coffee is to graphically create a quantum circuit whose measurement result is the binary number of your beverage.

Sounds complicated? ... Actually it's quite simple. Have at look at the instruction and the examples.
You can try ouut the examples on the [IBM Quantum Composer](http://quantum-computing.ibm.com/composer), before running it on the real Qoffee Maker.

## Quick Start

- Man kann sich aussuchen, ob man von einem Beispiel aus startet oder den Circuit selber baut
- Erklärung wie funktioniert ein Composer - per drag and drop reinziehbar
- Wird alles durch den Quantencomputer in der Cloud berechnet, der das Ergebnis im Composer ausgibt
- Je nachdem welches Ergebnis auf dem Composer ausgegeben wird, kann man dem Ergebniss entweder zustimmen oder nicht
- Zahlenbeispiele : 0 = Tee (000) , 1 = Heiße Schokolade (001) , 2 = Espresso (010) , 3 = Kaffee (011) , 4 = Cappuccino (100) , 5 = Latte Macchiatto (101) , 6 = Wiener Melange (110) , 7 = Americano (111) 


## Description of the Quantum Gates
"Quantum Gates" are the fundamental operations that can be applied to Qubits - which quantum computuers are based on.
...




## I want...

### … a Cappucino
Goal: Cappuccino = No. 4 = State 100
To make sure to certainly get a cappuccino, we need to build the Quantum Circuit such that the state 100 will come up with 100% probability.
The easiest way to do that is to apply an NOT-Gate (Pauli-X-Gate) on the Qubit q2.

### … nothing with caffein
Goal: Tea = No. 0 = State 000 or Hot Chocolate = No. 1 = State 001
Tea and Hot Chocolate are the only two drinks without caffein. To get each drink with an equal probability, we need to apply an H-Gate to q0. This brings our qubit into a superposition between 0 and 1, such that each state 000 and 001 have a 50% probability to result after the measuring, where the superposition collapses.

### … something to drink, it doesn’t matter what
Goal: every drink = every State
Applying an H-Gate to all 3 Qubits, brings the whole system into a superposition. As shown in the diagram, the probability for each state to result is the same. Thus the selection of your drink is completely left to chance. We hope you enjoy your quantum surprise :)

### … something with caffein, but not too strong
Goal: Cappuccino = No. 4 = State 100 or Latte Macchiato = No. 5 = State 101
Letting our Quantum Computer decide between Cappuccino and Latte Macchiato, we need to make sure either the state 100 or 101 will result after the measurement. Therefore, applying a NOT-Gate to q2 ensures the 1 in the first place of each state. Similarly does an H-Gate applied to q0 for the superposition of 0 and 1 in the third place of the state.

### … either tea or coffee (Bell State)
Goal: Tea = No. 0 = State 000 or Coffee = No. 3 = State 011
To get either a tea or coffee with equal probability a special state, the so-called „Bell State”, can be used. By applying an H-Gate to q0 a superposition for the last digit of the resulting state is set up. Applying then a CNOT-Gate to q1 as target and q0 as control qubit, it ensures q1 will flip its base state only, when q0 is 1. Thus only 000 or 011 can result after measurement.

### … an Espresso
Goal: Espresso = No. 2 = State 010
Getting a certain drink, in this case an Espresso, can also be done by applying several CNOT-Gates as it’s shown in the circuit below (on the right/left…)

### … a normal coffee
Goal: Coffee = No. 3 = State 011
To certainly get a normal coffee, we need to switch the states of both q0 and q1. This can be done easily by applying NOT-Gates like for q0. But we can also go a more quantum-computational way using two Hadamard-Gates and a Z-Gate in between. As you can see, bringing a qubit into an equal superposition (first H-Gate), modifying it by turning its vector around the Z-axis (Z-Gate), and reversing the superposition (second H-Gate), turns out to be the same as applying a simple NOT-Gate.


- Screenshot noch einfügen


## Detailed information (optional)

Pro Version Beispiele

## How to build your own Qoffee Maker at home
... ???


# instructions for the "hacker" Theme

## Welcome to GitHub Pages

You can use the [editor on GitHub](https://github.com/JanLahmann/Qoffee-Maker/edit/website/README.md) to maintain and preview the content for your website in Markdown files.

Whenever you commit to this repository, GitHub Pages will run [Jekyll](https://jekyllrb.com/) to rebuild the pages in your site, from the content in your Markdown files.

### Markdown

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```

For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/JanLahmann/Qoffee-Maker/settings/pages). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://docs.github.com/categories/github-pages-basics/) or [contact support](https://support.github.com/contact) and we’ll help you sort it out.
