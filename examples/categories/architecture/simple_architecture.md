# System Architecture Diagram

This example demonstrates a system architecture diagram with proper shape libraries.

```tikz
\documentclass{standalone}
\usepackage{tikz}
\usetikzlibrary{shapes.geometric,shapes.multipart,arrows.meta,positioning}

\begin{document}
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
\end{document}
```

## Alternative Version (Without Cylinder Shape)

If your server doesn't support the cylinder shape, you can use this alternative version:

```tikz
\documentclass{standalone}
\usepackage{tikz}
\usetikzlibrary{arrows.meta,positioning,shapes.geometric}

\begin{document}
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
\end{document}
```
