// Функция, создающая virtual-node
const h = (tag, props, children) => {
  return {
    tag,
    props,
    children,
  };
};

// Пример virtual-node
const virtualDomObject = {
  tag: 'div',
  props: {
    class: 'active',
  },
  children: [
    {
      tag: 'h1',
      props: 'title',
      children: 'Какой-то заголовок',
    },
    {
      tag: 'img',
      props: {
        src:
          'https://tamlife.ru/uploads/2019/02/978.db7475b2cb28032ceb784376846b265e-380x280.jpg',
        alt: 'Тамбов',
      },
    },
  ],
};

// Функция, которая монтирует virtual node в реальный DOM
const mount = (virtualNode, container) => {
  const element = document.createElement(virtualNode.tag);

  if (typeof virtualNode.children === 'string') {
    element.textContent = virtualNode.children;
  } else {
    virtualNode.children &&
      virtualNode.children.forEach((child) => mount(child, element));
  }
  virtualNode.props &&
    Object.keys(virtualNode.props).forEach((key) =>
      element.setAttribute(key, virtualNode.props[key])
    );

  container.appendChild(element);
  virtualNode.$element = element;
};

// Функция, которая демонтирует virtual-node из реального DOM
const unmount = (virtualNode) => {
  virtualNode.$element.parentNode.removeChild(virtualNode.$element);
};

// Функция, которая сравнивает два virtual node и находит разницу
const patch = (n1, n2) => {
  if (n1.tag !== n2.tag) {
    mount(n2, n1.$element.parentNode);
    unmount(n1);
  } else {
    n2.$element = n1.$element;
    if (typeof n2.children === 'string') {
      n2.$element.textContent = n2.children;
    } else {
      while (n2.$element.attributes.length > 0) {
        n2.$element.removeAttribute(n2.$element.attributes[0].name);
      }
      for (const key in n2.props) {
        n2.$element.setAttribute(key, n2.props[key]);
      }
      if (typeof n1.children === 'string') {
        n2.$element.textContent = null;
        n2.children.forEach((child) => {
          mount(child, n2.$element);
        });
      } else {
        const commonChildrenLength = Math.min(
          n1.children.length,
          n2.children.length
        );
        for (let i = 0; i < commonChildrenLength; i++) {
          patch(n1.children[i], n2.children[i]);
        }

        if (n1.children.length > n2.children.length) {
          n1.children.slice(n2.children.length).forEach((child) => {
            unmount(child);
          });
        } else if (n2.children.length > n1.children.length) {
          n2.children.slice(n1.children.length).forEach((child) => {
            mount(child);
          });
        }
      }
    }
  }
};
