# System Architecture Examples (Fixed)

This document contains examples of system architecture diagrams with proper shape libraries.

## 1. Three-Tier Architecture with Cylinder Shape

```tikz
\usepackage{tikz}
\usetikzlibrary{shapes.geometric,arrows.meta,positioning}
\begin{tikzpicture}[
    font=\sf \scriptsize,
    >=Stealth,
    server/.style={draw, rectangle, rounded corners, fill=blue!20, text centered, text width=2cm, minimum height=1cm},
    database/.style={draw, cylinder, shape border rotate=90, aspect=0.3, fill=green!20, text centered, minimum height=1.5cm},
    client/.style={draw, rectangle, rounded corners, fill=orange!20, text centered, text width=1.5cm, minimum height=1cm},
    proxy/.style={draw, rectangle, rounded corners, fill=red!20, text centered, text width=2cm, minimum height=1cm},
    cloud/.style={draw, ellipse, fill=gray!20, text centered, minimum height=1cm, minimum width=2cm},
    line/.style={draw, thick, color=black!50, -Stealth},
    dashed/.style={draw, dashed, color=black!50, -Stealth},
]

% Define the positions
\node (client1) [client] {Client 1};
\node (client2) [client, below=1cm of client1] {Client 2};
\node (client3) [client, below=1cm of client2] {Client 3};

\node (proxy) [proxy, right=2cm of client2] {Load Balancer};

\node (server1) [server, above right=1cm and 2cm of proxy] {Web Server 1};
\node (server2) [server, right=2cm of proxy] {Web Server 2};
\node (server3) [server, below right=1cm and 2cm of proxy] {Web Server 3};

\node (db) [database, right=3cm of server2] {Database};
\node (cloud) [cloud, above=1.5cm of db] {Cloud Storage};

% Connect the nodes
\path [line] (client1) -- (proxy);
\path [line] (client2) -- (proxy);
\path [line] (client3) -- (proxy);

\path [line] (proxy) -- (server1);
\path [line] (proxy) -- (server2);
\path [line] (proxy) -- (server3);

\path [line] (server1) -- (db);
\path [line] (server2) -- (db);
\path [line] (server3) -- (db);

\path [dashed] (server1) -- (cloud);
\path [dashed] (server2) -- (cloud);
\path [dashed] (server3) -- (cloud);

% Add labels
\node[text width=3cm, align=center, above=0.5cm of client1] {Client Tier};
\node[text width=3cm, align=center, above=0.5cm of proxy] {Proxy Tier};
\node[text width=3cm, align=center, above=0.5cm of server1] {Application Tier};
\node[text width=3cm, align=center, above=0.5cm of db] {Data Tier};
\end{tikzpicture}
```

## 2. Alternative Architecture (Without Cylinder Shape)

```tikz
\usepackage{tikz}
\usetikzlibrary{arrows.meta,positioning,shapes.geometric}
\begin{tikzpicture}[
    font=\sf \scriptsize,
    >=Stealth,
    server/.style={draw, rectangle, rounded corners, fill=blue!20, text centered, text width=2cm, minimum height=1cm},
    database/.style={draw, rectangle, rounded corners, fill=green!20, text centered, text width=2cm, minimum height=1.5cm},
    client/.style={draw, rectangle, rounded corners, fill=orange!20, text centered, text width=1.5cm, minimum height=1cm},
    proxy/.style={draw, rectangle, rounded corners, fill=red!20, text centered, text width=2cm, minimum height=1cm},
    cloud/.style={draw, ellipse, fill=gray!20, text centered, minimum height=1cm, minimum width=2cm},
    line/.style={draw, thick, color=black!50, -Stealth},
    dashed/.style={draw, dashed, color=black!50, -Stealth},
]

% Define the positions
\node (client1) [client] {Client 1};
\node (client2) [client, below=1cm of client1] {Client 2};
\node (client3) [client, below=1cm of client2] {Client 3};

\node (proxy) [proxy, right=2cm of client2] {Load Balancer};

\node (server1) [server, above right=1cm and 2cm of proxy] {Web Server 1};
\node (server2) [server, right=2cm of proxy] {Web Server 2};
\node (server3) [server, below right=1cm and 2cm of proxy] {Web Server 3};

\node (db) [database, right=3cm of server2] {Database};
\node (cloud) [cloud, above=1.5cm of db] {Cloud Storage};

% Connect the nodes
\path [line] (client1) -- (proxy);
\path [line] (client2) -- (proxy);
\path [line] (client3) -- (proxy);

\path [line] (proxy) -- (server1);
\path [line] (proxy) -- (server2);
\path [line] (proxy) -- (server3);

\path [line] (server1) -- (db);
\path [line] (server2) -- (db);
\path [line] (server3) -- (db);

\path [dashed] (server1) -- (cloud);
\path [dashed] (server2) -- (cloud);
\path [dashed] (server3) -- (cloud);

% Add labels
\node[text width=3cm, align=center, above=0.5cm of client1] {Client Tier};
\node[text width=3cm, align=center, above=0.5cm of proxy] {Proxy Tier};
\node[text width=3cm, align=center, above=0.5cm of server1] {Application Tier};
\node[text width=3cm, align=center, above=0.5cm of db] {Data Tier};
\end{tikzpicture}
```

## 3. Microservices Architecture

```tikz
\usepackage{tikz}
\usetikzlibrary{shapes.geometric,arrows.meta,positioning,fit,backgrounds}
\begin{tikzpicture}[
    font=\sf \scriptsize,
    >=Stealth,
    service/.style={draw, rectangle, rounded corners, fill=blue!10, text centered, text width=2cm, minimum height=1cm},
    database/.style={draw, rectangle, rounded corners, fill=green!10, text centered, text width=1.5cm, minimum height=1.2cm},
    gateway/.style={draw, rectangle, rounded corners, fill=red!10, text centered, text width=2cm, minimum height=1cm},
    client/.style={draw, rectangle, rounded corners, fill=orange!10, text centered, text width=1.5cm, minimum height=1cm},
    container/.style={draw, rectangle, rounded corners, dashed, inner sep=0.5cm},
    line/.style={draw, thick, color=black!50, -Stealth},
    bidirectional/.style={draw, thick, color=black!50, <->}
]

% API Gateway
\node[gateway] (gateway) at (0,0) {API Gateway};

% Client
\node[client, left=2cm of gateway] (client) {Client};

% Services
\node[service, below right=1cm and 1cm of gateway] (auth) {Auth Service};
\node[service, right=1cm of auth] (user) {User Service};
\node[service, right=1cm of user] (order) {Order Service};
\node[service, right=1cm of order] (payment) {Payment Service};

% Databases
\node[database, below=1cm of auth] (authdb) {Auth DB};
\node[database, below=1cm of user] (userdb) {User DB};
\node[database, below=1cm of order] (orderdb) {Order DB};
\node[database, below=1cm of payment] (paymentdb) {Payment DB};

% Connections
\draw[line] (client) -- (gateway);
\draw[line] (gateway) -- (auth);
\draw[line] (gateway) -- (user);
\draw[line] (gateway) -- (order);
\draw[line] (gateway) -- (payment);

\draw[line] (auth) -- (authdb);
\draw[line] (user) -- (userdb);
\draw[line] (order) -- (orderdb);
\draw[line] (payment) -- (paymentdb);

% Service-to-service communication
\draw[bidirectional] (auth) -- (user);
\draw[bidirectional] (user) -- (order);
\draw[bidirectional] (order) -- (payment);

% Containers
\begin{pgfonlayer}{background}
    \node[container, fit=(auth)(authdb), label=above:Auth Container] (authcontainer) {};
    \node[container, fit=(user)(userdb), label=above:User Container] (usercontainer) {};
    \node[container, fit=(order)(orderdb), label=above:Order Container] (ordercontainer) {};
    \node[container, fit=(payment)(paymentdb), label=above:Payment Container] (paymentcontainer) {};
\end{pgfonlayer}

% Title
\node[font=\bf, above=0.5cm of gateway] {Microservices Architecture};
\end{tikzpicture}
```

## 4. Event-Driven Architecture

```tikz
\usepackage{tikz}
\usetikzlibrary{shapes.geometric,arrows.meta,positioning,fit,backgrounds}
\begin{tikzpicture}[
    font=\sf \scriptsize,
    >=Stealth,
    service/.style={draw, rectangle, rounded corners, fill=blue!10, text centered, text width=2cm, minimum height=1cm},
    queue/.style={draw, rectangle, fill=yellow!10, text centered, text width=2cm, minimum height=0.8cm},
    database/.style={draw, rectangle, rounded corners, fill=green!10, text centered, text width=1.5cm, minimum height=1.2cm},
    client/.style={draw, rectangle, rounded corners, fill=orange!10, text centered, text width=1.5cm, minimum height=1cm},
    line/.style={draw, thick, color=black!50, -Stealth}
]

% Event Bus
\node[queue] (eventbus) at (0,0) {Event Bus};

% Services
\node[service, above left=1cm and 1cm of eventbus] (producer1) {Producer 1};
\node[service, left=1cm of eventbus] (producer2) {Producer 2};
\node[service, below left=1cm and 1cm of eventbus] (producer3) {Producer 3};

\node[service, above right=1cm and 1cm of eventbus] (consumer1) {Consumer 1};
\node[service, right=1cm of eventbus] (consumer2) {Consumer 2};
\node[service, below right=1cm and 1cm of eventbus] (consumer3) {Consumer 3};

% Databases
\node[database, right=1cm of consumer1] (db1) {DB 1};
\node[database, right=1cm of consumer2] (db2) {DB 2};
\node[database, right=1cm of consumer3] (db3) {DB 3};

% Client
\node[client, left=1cm of producer2] (client) {Client};

% Connections
\draw[line] (client) -- (producer2);
\draw[line] (producer1) -- (eventbus);
\draw[line] (producer2) -- (eventbus);
\draw[line] (producer3) -- (eventbus);

\draw[line] (eventbus) -- (consumer1);
\draw[line] (eventbus) -- (consumer2);
\draw[line] (eventbus) -- (consumer3);

\draw[line] (consumer1) -- (db1);
\draw[line] (consumer2) -- (db2);
\draw[line] (consumer3) -- (db3);

% Title
\node[font=\bf, above=0.5cm of eventbus] {Event-Driven Architecture};
\end{tikzpicture}
```
