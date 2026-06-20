export const generateProblem = (level) => {
  // Levels:
  // L1 (Score 0-4): Sumas
  // L2 (Score 5-9): Sumas, Restas
  // L3 (Score 10-14): Sumas, Restas, Multiplicación
  // L4 (Score 15+): Sumas, Restas, Multiplicación, División
  
  const operations = ['+'];
  if (level >= 2) operations.push('-');
  if (level >= 3) operations.push('*');
  if (level >= 4) operations.push('/');
  
  const op = operations[Math.floor(Math.random() * operations.length)];
  
  // Base numbers
  let a, b, answer;
  const templates = [];

  if (op === '+') {
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    if (level > 2) {
      a += Math.floor(Math.random() * 10);
      b += Math.floor(Math.random() * 10);
    }
    answer = a + b;
    
    templates.push(
      {
        text: `El astronauta exploró ${a} planetas por la mañana y ${b} planetas por la tarde. ¿Cuántos planetas exploró en total?`,
        variables: [
          { label: 'Planetas en la mañana', value: a },
          { label: 'Planetas en la tarde', value: b }
        ]
      },
      {
        text: `Nuestra nave tiene ${a} cohetes rojos y ${b} cohetes azules. ¿Cuántos cohetes tenemos en la nave?`,
        variables: [
          { label: 'Cohetes rojos', value: a },
          { label: 'Cohetes azules', value: b }
        ]
      },
      {
        text: `En la estación espacial había ${a} alienígenas. Acaban de llegar ${b} más. ¿Cuántos alienígenas hay ahora?`,
        variables: [
          { label: 'Alienígenas que había', value: a },
          { label: 'Alienígenas que llegaron', value: b }
        ]
      }
    );
  } else if (op === '-') {
    a = Math.floor(Math.random() * 15) + 5;
    b = Math.floor(Math.random() * (a - 1)) + 1; // b is strictly less than a
    answer = a - b;
    
    templates.push(
      {
        text: `Teníamos ${a} tanques de oxígeno. Durante el viaje se gastaron ${b} tanques. ¿Cuántos tanques de oxígeno nos quedan?`,
        variables: [
          { label: 'Tanques iniciales', value: a },
          { label: 'Tanques gastados', value: b }
        ]
      },
      {
        text: `Un cometa traía ${a} rocas de hielo. Al pasar cerca del sol, se derritieron ${b} rocas. ¿Cuántas rocas le quedan al cometa?`,
        variables: [
          { label: 'Rocas de hielo iniciales', value: a },
          { label: 'Rocas derretidas', value: b }
        ]
      }
    );
  } else if (op === '*') {
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * 9) + 2;
    answer = a * b;
    
    templates.push(
      {
        text: `Descubrimos ${a} galaxias nuevas. Cada galaxia tiene ${b} estrellas gigantes. ¿Cuántas estrellas gigantes encontramos en total?`,
        variables: [
          { label: 'Galaxias descubiertas', value: a },
          { label: 'Estrellas por galaxia', value: b }
        ]
      },
      {
        text: `Para el viaje, llevamos ${a} cajas de comida espacial. En cada caja hay ${b} raciones. ¿Cuántas raciones tenemos en total?`,
        variables: [
          { label: 'Cajas de comida', value: a },
          { label: 'Raciones por caja', value: b }
        ]
      }
    );
  } else if (op === '/') {
    b = Math.floor(Math.random() * 9) + 2;
    answer = Math.floor(Math.random() * 9) + 2;
    a = b * answer; // Ensure exact division
    
    templates.push(
      {
        text: `Tenemos ${a} cristales de energía que debemos repartir en partes iguales entre nuestras ${b} naves de exploración. ¿Cuántos cristales recibirá cada nave?`,
        variables: [
          { label: 'Cristales de energía', value: a },
          { label: 'Naves de exploración', value: b }
        ]
      },
      {
        text: `El capitán debe organizar a ${a} reclutas espaciales en ${b} escuadrones iguales. ¿Cuántos reclutas irán en cada escuadrón?`,
        variables: [
          { label: 'Total de reclutas', value: a },
          { label: 'Cantidad de escuadrones', value: b }
        ]
      }
    );
  }

  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    ...selectedTemplate,
    answer,
    op
  };
};
