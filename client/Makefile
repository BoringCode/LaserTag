#----------------------------------------------------
#makefile for the simpleClient program
#----------------------------------------------------
CXX = gcc
CXXFLAGS = -Wall
EXEC = simpleClient
OBJ = simpleClient2.o
DIST = simpleClient.tar

$(EXEC): $(OBJ)
	gcc -o $(EXEC) $(OBJ)

simpleClient: $(OBJ)

clean:
	rm -f $(EXEC)

dist:
	tar -cvf $(DIST) Makefile *.c
	@echo "The tarfile is '$(DIST)'."

simpleClient.o: simpleClient.c
