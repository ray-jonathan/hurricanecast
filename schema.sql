create table users
(
  id serial primary key,
  email varchar (200),
  validated boolean default null
);

create table forecasts
(
  id serial primary key,
  subject varchar (100),
  body text,
  timestamp bigint default extract(epoch from now()) * 1000
);