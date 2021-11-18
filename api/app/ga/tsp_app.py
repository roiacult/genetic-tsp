import random
import copy
import os
import time
import csv


# City class
class City(object):
    """
    x: longitude of the city
    y: latitude of the city
    name: city name
    code : city wilaya code
    distance_to: dictionary of distances to other cities
    """
    def __init__(self, name, x, y, code, distance_to=None):
        # Name and coordinates:
        self.name = name
        self.x = self.graph_x = x
        self.y = self.graph_y = y
        self.code = code
        # Appends itself to the global list of cities:
        # Creates a dictionary of the distances to all the other cities (distance to it self is 0)
        self.distance_to = {self.name:0.0}
        if distance_to:
            self.distance_to = distance_to

    def calculate_distances(self, cities): 
        '''
            Calculate distance beteween current city to all other city
        ''' 
        for city in cities:
            if city.name != self.name:
                tmp_dist = self.point_dist(self.x, self.y, city.x, city.y)
                self.distance_to[city.name] = tmp_dist

    # Calculates the distance between two points..
    def point_dist(self, x1,y1,x2,y2):
        return ((x1-x2)**2 + (y1-y2)**2)**(0.5)


# Route Class
class Route(object):
    """
    TODO: add option to sepecifie initial city 
    Store path of cities (randomly initialized)

    route: List of cities
    length: float length of route (full loop)

    is_valid_route(): Returns True if the route contains all cities in list_of_cities ONCE and ONLY ONCE
    """
    def __init__(self, cities):
        # initiates route equal to a randomly shuffled list_of_cities
        self.route = sorted(cities, key=lambda *args: random.random())
        ### Calculates its length:
        self.recalc_rt_len()

    def recalc_rt_len(self):
        '''
        re-calculate route lenght
        '''
        self.length = 0.0
        for city in self.route:
            # set up a next city variable that points to the next city in the list 
            # and wraps around at the end:
            next_city = self.route[self.route.index(city)-len(self.route)+1]
            # Uses the first city's distance_to attribute to find the distance to the next city:
            dist_to_next = city.distance_to[next_city.name]
            # adds this length to its length attr.
            self.length += dist_to_next

    def pr_cits_in_rt(self, print_route=False):
        '''
        Prints cities, form => <cityname1,cityname2,cityname3...>
        '''
        cities_str = ''
        for city in self.route:
            cities_str += city.name + ','
        cities_str = cities_str[:-1] # chops off last comma
        if print_route:
            print('    ' + cities_str)

    def pr_vrb_cits_in_rt(self):
        '''
        Prints coordinate pairs, form => <|x,y|x,y|x,y|...>
        '''
        cities_str = '|'
        for city in self.route:
            cities_str += str(city.x) + ',' + str(city.y) + '|'
        print(cities_str)

    def to_dict(self):
        cities_dict = {}

        for city in self.route:
            cities_dict[city.name] = {'x': city.x, 'y': city.y, 'code': city.code}
        
        for i in range(len(self.route)):
            city = self.route[i]
            cities_dict[city.name] = {'x': city.x, 'y': city.y, 'index': i, 'code' : city.code}
    
        return cities_dict

    def is_valid_route(self, cities):
        '''
        Returns True if the route contains all cities in list_of_cities ONLY ONCE, False if there are duplicates.

        Use: if there are multiples of the same city in a route,
        it will converge until all the cities are that same city (length = 0)
        '''
        for city in cities:
            # helper function defined up to
            if self.count_mult(self.route,lambda c: c.name == city.name) > 1:
                return False
        return True

    # Returns the number of pred in sequence (duplicate checking.)
    def count_mult(self, seq, pred):
        return sum(1 for v in seq if pred(v))


# Population of Route() objects
class RoutePop(object):
    """
    Contains a list of route objects and (act as Routes population)

    self.rt_pop: list of Route objects (Population)
    self.size: Population length
    self.fittest: Sourted route in self.rt_pop

    """
    def __init__(self, cities, size, initialise):
        self.rt_pop = []
        self.size = size
        # If we want to initialise a population.rt_pop:
        if initialise:
            for x in range(0,size):
                new_rt = Route(cities)
                self.rt_pop.append(new_rt)
            self.get_fittest()

    def get_fittest(self):
        '''
        Calcualtes fittest route, sets self.fittest to it, and returns it. 
        '''
        # sorts the list based on the routes' lengths
        sorted_list = sorted(self.rt_pop, key=lambda x: x.length, reverse=False)
        self.fittest = sorted_list[0]
        return self.fittest


# Class contains GA utils and functions
class GA(object):

    def crossover(self, parent1, parent2, cities):
        '''
        Route(), Route() --> Route()

        Returns a child route Route() after breeding the two parent routes. 
        Routes must be of same length.

        Breeding is done by selecting a random range of parent1, and placing it into the empty child route (in the same place).
        Gaps are then filled in, without duplicates, in the order they appear in parent2.
        '''

        # new child Route()
        child_rt = Route(cities)

        for x in range(0,len(child_rt.route)):
            child_rt.route[x] = None

        # Two random integer indices of the parent1:
        start_pos = random.randint(0,len(parent1.route))
        end_pos = random.randint(0,len(parent1.route))


        #### takes the sub-route from parent one and sticks it in itself:
        # if the start position is before the end:
        if start_pos < end_pos:
            # do it in the start-->end order
            for x in range(start_pos,end_pos):
                child_rt.route[x] = parent1.route[x] # set the values to eachother
        # if the start position is after the end:
        elif start_pos > end_pos:
            # do it in the end-->start order
            for i in range(end_pos,start_pos):
                child_rt.route[i] = parent1.route[i] # set the values to eachother


        # Cycles through the parent2. And fills in the child_rt
        # cycles through length of parent2:
        for i in range(len(parent2.route)):
            # if parent2 has a city that the child doesn't have yet:
            if not parent2.route[i] in child_rt.route:
                # it puts it in the first 'None' spot and breaks out of the loop.
                for x in range(len(child_rt.route)):
                    if child_rt.route[x] == None:
                        child_rt.route[x] = parent2.route[i]
                        break
        # repeated until all the cities are in the child route

        # returns the child route (of type Route())
        child_rt.recalc_rt_len()
        return child_rt

    def mutate(self, route_to_mut, k_mut_prob):
        '''
        Route() --> Route()

        Swaps two random indexes in route_to_mut.route. Runs k_mut_prob*100 % of the time
        '''
        # k_mut_prob %
        if random.random() < k_mut_prob:

            # two random indices:
            mut_pos1 = random.randint(0,len(route_to_mut.route)-1)
            mut_pos2 = random.randint(0,len(route_to_mut.route)-1)

            # if they're the same, skip to the chase
            if mut_pos1 == mut_pos2:
                return route_to_mut

            # Otherwise swap them:
            city1 = route_to_mut.route[mut_pos1]
            city2 = route_to_mut.route[mut_pos2]

            route_to_mut.route[mut_pos2] = city1
            route_to_mut.route[mut_pos1] = city2

        # Recalculate the length of the route (updates it's .length)
        route_to_mut.recalc_rt_len()

        return route_to_mut
    
    def tournament_select(self, population, cities, tournament_size):
        '''
        RoutePop() --> Route()

        Randomly selects tournament_size amount of Routes() from the input population.
        Takes the fittest from the smaller number of Routes(). 

        Principle: gives worse Routes() a chance of succeeding, but favours good Routes()
        '''

        # New smaller population (not intialised)
        tournament_pop = RoutePop(cities , size=tournament_size,initialise=False)

        # fills it with random individuals (can choose same twice)
        for i in range(tournament_size-1):
            tournament_pop.rt_pop.append(random.choice(population.rt_pop))
        
        # returns the fittest:
        return tournament_pop.get_fittest()

    def evolve_population(self, init_pop, cities, k_mut_prob, elitism, tournament_size):
        '''
        RoutePop() --> RoutePop()

        Takes a population and evolves it then returns the new population. 
        '''

        #makes a new population:
        descendant_pop = RoutePop(cities, size=init_pop.size, initialise=True)

        # Elitism offset (amount of Routes() carried over to new population)
        elitismOffset = 0

        # if we have elitism, set the first of the new population to the fittest of the old
        if elitism:
            descendant_pop.rt_pop[0] = init_pop.fittest
            elitismOffset = 1

        # Goes through the new population and fills it with the child of two tournament winners from the previous populatio
        for x in range(elitismOffset,descendant_pop.size):
            # two parents:
            tournament_parent1 = self.tournament_select(init_pop, cities, tournament_size)
            tournament_parent2 = self.tournament_select(init_pop, cities, tournament_size)

            # A child:
            tournament_child = self.crossover(tournament_parent1, tournament_parent2, cities)

            # Fill the population up with children
            descendant_pop.rt_pop[x] = tournament_child

        # Mutates all the routes (mutation with happen with a prob p = k_mut_prob)
        for route in descendant_pop.rt_pop:
            if random.random() < 0.3:
                self.mutate(route,k_mut_prob)

        # Update the fittest route:
        descendant_pop.get_fittest()

        return descendant_pop


# k_mut_prob=k_mut_prob,
# n_generations=k_n_generations,
# pop_size=k_population_size,
# tournament_size=tournament_size,
# elitism=elitism,
# websocket=websocket
class TspAPP(object):
    """
    Runs the application
    """
    def __init__(self, k_mut_prob, n_generations,pop_size, tournament_size, elitism, csv_file, websocket=None):
        '''
        Initiates an TspAPP object to run for n_generations with a population of size pop_size
        '''

        # save params
        self.k_mut_prob = k_mut_prob
        self.pop_size = pop_size
        self.n_generations = n_generations
        self.tournament_size = tournament_size
        self.elitism = elitism
        self.csv_file = csv_file

        # save websockets objects
        self.websocket = websocket

        # create list of cities
        self.cities =    []

        # read cities from file
        self.read_csv()
        
        # launch GA loop
        self.GA_loop()

    def set_city_gcoords(self):
        '''
        All cities have graph_x and graph_y attributes that are only referenced when showing them on the map.
        This method takes the original city.x and city.y and transforms them so that the coordinates map fully onto the 300x300 map view.
        '''

        # defines some variables (we will set them next)
        min_x = 100000
        max_x = -100000
        min_y = 100000
        max_y = -100000

        #finds the proper maximum/minimum
        for city in self.cities:

            if city.x < min_x:
                min_x = city.x
            if city.x > max_x:
                max_x = city.x

            if city.y < min_y:
                min_y = city.y
            if city.y > max_y:
                max_y = city.y

        # shifts the graph_x so the leftmost city starts at x=0, same for y.
        for city in self.cities:
            city.graph_x = (city.graph_x + (-1*min_x))
            city.graph_y = (city.graph_y + (-1*min_y))

        # resets the variables now we've made changes
        min_x = 100000
        max_x = -100000
        min_y = 100000
        max_y = -100000

        #finds the proper maximum/minimum
        for city in self.cities:

            if city.graph_x < min_x:
                min_x = city.graph_x
            if city.graph_x > max_x:
                max_x = city.graph_x

            if city.graph_y < min_y:
                min_y = city.graph_y
            if city.graph_y > max_y:
                max_y = city.graph_y

        # if x is the longer dimension, set the stretch factor to 300 (px) / max_x. Else do it for y. This conserves aspect ratio.
        if max_x > max_y:
            stretch = 300 / max_x
        else:
            stretch = 300 / max_y

        # stretch all the cities so that the city with the highest coordinates has both x and y < 300
        for city in self.cities:
            city.graph_x *= stretch
            city.graph_y = 300 - (city.graph_y * stretch)

    def read_csv(self):
        with open(self.csv_file, 'rt') as f:
            reader = csv.reader(f)
            for row in reader:
                self.cities.append( City(row[0],float(row[1]),float(row[2]), row[3]))
        for city in self.cities:
            city.calculate_distances(self.cities)
            

    async def GA_loop(self):
        '''
        Main logic loop for the GA. Creates and manages populations, running variables etc.
        '''

        # takes the time to measure the elapsed time
        start_time = time.time()

        # Creates the population:
        print("Creates the population:")
        the_population = RoutePop(self.cities, self.pop_size, True)
        print ("Finished Creation of the population")

        # the_population.rt_pop[0].route = [1,8,38,31,44,18,7,28,6,37,19,27,17,43,30,36,46,33,20,47,21,32,39,48,5,42,24,10,45,35,4,26,2,29,34,41,16,22,3,23,14,25,13,11,12,15,40,9]
        # the_population.rt_pop[0].recalc_rt_len()
        # the_population.get_fittest()

        #checks to make sure there are no duplicate cities:
        if the_population.fittest.is_valid_route(self.cities) == False:
            raise NameError('Multiple cities with same name. Check cities.')
            return # if there are, raise a NameError and return

        # gets the best length from the first population (no practical use, just out of interest to see improvements)
        initial_length = the_population.fittest.length

        # Creates a random route called best_route. It will store our overall best route.
        best_route = Route(self.cities)

        # Main process loop (for number of generations)
        for x in range(1,self.n_generations):

            # Evolves the population:
            the_population = GA().evolve_population(the_population, self.cities, self.k_mut_prob, self.elitism, self.tournament_size)

            # If we have found a new shorter route, save it to best_route
            if the_population.fittest.length < best_route.length:
                # set the route (copy.deepcopy because the_population.fittest is persistent in this loop so will cause reference bugs)
                best_route = copy.deepcopy(the_population.fittest)

            # Praioredisints info to the terminal:
            self.clear_term()
            print('Generation {0} of {1}'.format(x,self.n_generations))
            print(' ')
            print('Overall fittest has length {0:.2f}'.format(best_route.length))
            print('and goes via:')
            best_route.pr_cits_in_rt(True)
            print(' ')
            print('Current fittest has length {0:.2f}'.format(the_population.fittest.length))
            print('And goes via:')
            the_population.fittest.pr_cits_in_rt(True)
            print(' ')
            print('''The screen with the maps may become unresponsive if the population size is too large. It will refresh at the end.''')
            await self.websocket.send_json(best_route.to_dict())
            # time.sleep(0.5)

        # takes the end time of the run:
        end_time = time.time()

        # Prints final output to terminal:
        self.clear_term()
        print('Finished evolving {0} generations.'.format(self.n_generations))
        print("Elapsed time was {0:.1f} seconds.".format(end_time - start_time))
        print(' ')
        print('Initial best distance: {0:.2f}'.format(initial_length))
        print('Final best distance:   {0:.2f}'.format(best_route.length))
        print('The best route went via:')
        best_route.pr_cits_in_rt(print_route=True)

    # Helper function for clearing terminal window
    def clear_term(self):
        os.system('cls' if os.name=='nt' else 'clear')

