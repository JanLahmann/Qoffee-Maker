# Welcome to the Qoffee Maker <img src="Bilder/QuoffeeMug_vector.png" width="150">

## Introduction
Qoffee Maker is based on [Quantum Computing](http://ibm.com/quantum-computing) and will produce a coffee, capuccino, etc based on the measurement result of a Quantum Circuit. 

All you need to do to get your favourite type of coffee is to graphically create a quantum circuit whose measurement result is the binary number of your beverage.

Sounds complicated?  
... Actually it's quite simple. Have at look at the Quick Start and the examples below.

You can try out the examples on the [IBM Quantum Composer](http://quantum-computing.ibm.com/composer), before running it on the real Qoffee Maker. A short intro to the IBM Quantum Composer is available [here](Composer.md), a more detailed overview can be found [here](https://quantum-computing.ibm.com/composer/docs/iqx/overview).


## Quick Start

### Beverages

Our Qoffee Maker offers eight beverages, which can be mapped to three-digit binary numbers with the canonical mapping 0 -> 000, 1 -> 001, 2 -> 010, ..., 6 -> 110, 7 -> 111.  

<img src="Bilder/übersicht.png" width="300">


### How to obtain your coffee of choice
The following examples illustrate how the standard gates (NOT, CNOT, H) can be used to solve the coffee puzzle. A short description of these gates is [here](Gates.md), for more details see the [Operations glossary](https://quantum-computing.ibm.com/composer/docs/iqx/operations_glossary).


#### I want something to drink, it doesn’t matter what

Applying an H-Gate to all 3 Qubits, brings the whole system into an equal superposition. Thus, the selection of your drink is completely left to chance.  
We hope you enjoy your quantum surprise :). 
Try this circuit [here](https://quantum-computing.ibm.com/composer/files/new?initial=N4IgdghgtgpiBcICSACA7hMAXFBnA9rFgBYCWYA5ilvigCYBO5A1gDQqk534y5iCYBDigQsWGA3TERIViACOEXFAQgA8gAUAogDkAigEEAygFkUAJgB0ABgDcAHTDkAxgBsArnRgo78mC9IARgCMFs4%2B9mAOcgwwVHIA2gDMALoRTjFUTkmpDg7EKAlWOWD5CUHFpfFmqTIgnrjppAAOWKT4YCogAL5AA). 

<img src="Bilder/image.png" width="600">


#### I want a Cappucino

To get a cappuccino, which is beverage number 4 (encoded with the binary number 100), you need to build the Quantum Circuit such that the state 100 will come up with 100% probability.  
Remember: The qubits are ordered q2, q1, q0, and each are initialized with 0.  
The simplest way to build the desired "capuccino circuit" is to apply an NOT-Gate to qubit q2, which flips the state from |000> to |100>.  
Try this circuit [here](https://quantum-computing.ibm.com/composer/files/new?initial=N4IgdghgtgpiBcIDCEAOBXAxpglmA9iADQgCOEAzlAiAPIAKAogHICKAggMoCyABAEwA6AAwBuADpg8mADboAJjF7iyMGTgBGARkHSVEsJNIAnGAHNepANoBmALoHMpi5lsPJkgB6Wr-B8RBFCiccVAAXHHwwGhAAXyA), or see a [screenshot](Bilder/cappuccino.png).


#### No caffein, please

Tea (0, 000) and Hot Chocolate (1, 001) are the only two drinks without caffein. 

To get each of these two drinks with equal probability, you can apply an H-Gate to q0.  
This brings qubit q0 into a superposition of |0> and |1>, such that each state |000> and |001> have a 50% measurement probability.  
Try this circuit [here](https://quantum-computing.ibm.com/composer/files/new?initial=N4IgdghgtgpiBcIByB7ABAYwgM2zAlmADRoAOANjBAM5xEgCONUCIA8gAoCiSAigIIBlALJoATADoADAG4AOmEIZyAVwAmMNHMYxy%2BAEYBGCUu3ywChgCcYAczQMA2gGYAuuYw37GF%2B4UKACwdHKXcQeg1qT3xSABd8FDBWEABfIA), or see a [screenshot](Bilder/nothing.png).


#### I want something with caffein, but not too strong

To let the Quantum Circuit decide between Cappuccino (4, 100) and Latte Macchiato (5, 101), you can apply a NOT-Gate to q2 (i.e. flipping q2 to "1") and an H-Gate to q0.  
Try this circuit [here](https://quantum-computing.ibm.com/composer/files/new?initial=N4IgdghgtgpiBcICSACA7hMAXFBnA9rFgBYCWYA5uqSSgMYQBmjM5ANCgEYCuOY%2BOLPnx4sAJ3yUQbEAEcIuKAhAB5AAoBRAHIBFAIIBlALIoATADoADAG4AOmHJ0ANtwAmMFLbkwnpTgEZzRy87MHtZMRgqWQBtAGYAXVC6SKo6eKT7e2IUWMtMsAAPXJjTJOkQd1wU0gAHLFJJZRAAXyA), or see a [screenshot](Bilder/something2.png).


#### I want either tea or coffee

To get either a tea (0, 000) or coffee (3, 011) with equal probability, the so-called „Bell State” can be used. It is created by applying an H-Gate to q0 and a CNOT-Gate with q1 as target and q0 as control qubit.  
Try this circuit [here](https://quantum-computing.ibm.com/composer/files/new?initial=N4IgdghgtgpiBcICSACA7hMAXFMCWWAFjAE4pYwQoD2ZAxtQGaMxwA0IAjhAM5QIgA8gAUAogDkAigEEAygFkUAJgB0ABgDcAHTB4wdADYBXACYwUWrjAN4ARgEYVeupe1gdnEjADmKTgG0AZgBdNzovXzog0J0dQj9-NRj9AA8EpLYA%2B1CQDjMecLwAByw8ajABEABfIA), or see a [screenshot](Bilder/tea.png).


## Advanced Exercises
To spice up your beverage selection, you can try to find quantum circuits that solve the  [advanced exercises](Advanced-exercises.md).


## How to build your own Qoffee Maker at home
An initial code drop is available in this GitHub repo. Code cleanup will follow as well as documentation.  
In any case, you can use the [IBM Quantum Composer](http://quantum-computing.ibm.com/composer) to practice your skills in using fundamental quantum gates and execute quantum circuits on real quantum computers.

‚