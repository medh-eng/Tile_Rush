import {cp,mkdir,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist');
for(const file of ['index.html','styles.css','src','public']) await cp(file,`dist/${file}`,{recursive:true});
console.log('Static build written to dist/');
