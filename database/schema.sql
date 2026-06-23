CREATE TABLE owner(
    id INTEGER PRIMARY KEY NOT NULL,
    name VARCHAR NOT NULL
);

CREATE TABLE category (
    id INTEGER PRIMARY KEY NOT NULL,
    name VARCHAR NOT NULL,
    description VARCHAR(200)
);

CREATE TABLE idea (
    id INTEGER PRIMARY KEY NOT NULL,
    name VARCHAR NOT NULL,
    description VARCHAR(200),
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES category(id),
    status VARCHAR NOT NULL,
    owner_id INTEGER NOT null,
    FOREIGN KEY (owner_id) REFERENCES owner(id),
    date DATE
);